async-deco
==========
[![Build Status](https://travis-ci.org/sithmel/async-deco.svg?branch=master)](https://travis-ci.org/sithmel/async-deco)

async-deco is a collection of decorators. It allows to add features such as timeout, retry, dedupe, limit and much more!
They can be combined together using the "compose" function (included).

Here is the list of the decorators (available for callback/promise functions):

* [Log](#log)
* [Memoize](#memoize)
* [Cache](#cache)
* [Purge Cache](#purge-cache)
* [Proxy](#proxy)
* [Validator](#validator)
* [Fallback](#fallback)
* [Fallback value](#fallback-value)
* [Fallback cache](#fallback-cache)
* [Timeout](#timeout)
* [Retry](#retry)
* [Limit](#limit)
* [Atomic](#atomic)
* [Dedupe](#dedupe)
* [parallel](#parallel)
* [waterfall](#waterfall)
* [race](#race)
* [balance](#balance)
* [debounce](#debounce)
* [throttle](#throttle)

Callback and promises
=====================
All decorators are designed to work with functions using a callback or returning a promise. In case of callbacks, it must follow the [node convention](https://docs.nodejitsu.com/articles/errors/what-are-the-error-conventions): the callback should be the last argument and its arguments should be, an error instance and the output of the function.

Every decorator is available in two different flavours:
* callback based:
```js
var logDecorator = require('async-deco/callback/log');
```
This should be applied to functions with the node callback convention:
```js
var decoratedFunction = logDecorator(logger)(function (a, b, c, next) {
  ...
  next(undefined, result); // or next(error);
});
```
* and promise based:
```js
var logDecorator = require('async-deco/promise/log');
```
This should be used for function returning promises:
```js
var decoratedFunction = logDecorator(logger)(function (a, b, c) {
  return new Promise(function (resolve, reject) {
    ...
    resolve(result); // or reject(error);    
  });
});
```
Then you can run the decorated function.

Logging
=======
All decorators uses a "logging context" added using the decorator returned by "addLogger" (it works the same for callback/promises):
```js
var addLogger = require('async-deco/utils/add-logger');

function log(event, payload, ts, key) {
  // log here
}

function getKey(...) { // same arguments as the decorated function
  return key;
}
var logger = addLogger(log, getKey);
```
The decorator is created passing 2 functions. A log function and an optional getKey function.
The log function is called with the following arguments:
* evt: the name of the event
* payload: an object with additional information about this event
* ts: the time stamp for this event (in ms)
* key: a string representing a single execution. It can be used to understand what logs belong to the same execution.

The getKey function (optional) takes the same arguments of the decorated function and returns the key (see descrition above). The default is a random string.

The resulting decorator can wrap a function:
```js
var defaultLogger = require('async-deco/utils/default-logger');

var f = logger(function () {
  var log = defaultLogger.call(this);
  log('event-name', { ... data ... });
});
```
The defaultLogger function extracts the logger function from the context.
This is a very simple case but this pattern is really useful to share the log function between decorators:
```js
var addLogger = require('async-deco/utils/add-logger');
var logDecorator = require('async-deco/callback/log');
var timeoutDecorator = require('async-deco/callback/timeout');
var retryDecorator = require('async-deco/callback/retry');

var decorator = compose(
  addLogger(function (evt, payload, ts, key) {
    console.log(ts, evt, payload, key);
  }),
  logDecorator(),
  retryDecorator(2, undefined, Error),
  timeoutDecorator(20)
);

var f = decorator(... func ...);
```
Then when you execute the function "f":
```js
f(...args..., function (err, res) {
  ...
});
```
You can get something similar to:
```js
1459770371655, "start", undefined "12345"
1459770371675, "timeout", { ms: 20 } "12345"
1459770371675, "retry", { times: 1 } "12345"
1459770371695, "timeout", { ms: 20 } "12345"
1459770371700, "end", { result: ... } "12345"
```

To make this work, the addLogger decorator extends the context (this) with a new method __log.
The context attributes and methods are still available through the prototype chain. For this reason inspecting "this" using Object.keys and using this.hasOwnProperty('prop') can return an unexpected result.

Requiring the library
=====================
You can either:
```js
var memoizeDecorator = require('async-deco/callback/memoize');
```
or
```js
var memoizeDecorator = require('async-deco').callback.memoize;
```
or
```js
var callbackDecorators = require('async-deco');
var memoizeDecorator = callbackDecorators.callback.memoize;
```
I strongly advice to use the first method, especially when using browserify. It allows to import only the functions you are actually using.

Decorators
==========
The examples are related to the callback version. Just import the promise version in case of decorating promise based functions.

AddLogger
---------
It enables the logging for the whole chain of decorators. Read the description in the "Logging" paragraph.
You can use this decorator multiple times to add multiple loggers (and multiple keys).

Log
---
It logs when a function start, end and fail.
```js
var logDecorator = require('async-deco/callback/log');

var addLogs = logDecorator();
var myfunc = addLogs(function (..., cb) { .... });
```
When using multiple decorator, it can be useful to attach this decorator multiple times, to give an insight about when the original function starts/ends and when the decorated function is called. To tell what log is called you can add a prefix to the logs. For example:
```js
var logDecorator = require('async-deco/callback/log');

var addLogsToInnerFunction = logDecorator('inner-');
var addLogsToOuterFunction = logDecorator('outer-');
var cached = cacheDecorator(cache); // caching decorator

var myfunc =
  addLogsToOuterFunction(
  cached(
  addLogsToInnerFunction(
    function (..., cb) { .... }));
```
In this example outer-log-start outer-log-end (or outer-log-error) will be always called. The inner logs only in case of cache miss.

Memoize
-------
This decorator implements an "in RAM" cache. That means that is possible having non-string cache keys and non-serializable values.
The cache is LRU, so it is advisable picking up a fixed cache length.
```js
var memoizeDecorator = require('async-deco/callback/memoize');

var cached = memoizeDecorator({ error: ..., len: ..., ttl: ..., cacheKey: ....});
var myfunc = cached(function (..., cb) { .... });
```
The "options" object may contains:
* an "error" attribute. This can be either an Error constructor function, or a function returning true if the result should be considered an error. The function takes as argument the output of the decorated function: error, result. If the result is an error the returned value is not cached.
* "len": the size of the cache
* "ttl": the number of ms to consider the cache entry valid. If a cached value is stale it remains cached until it exceeds the size of the cache
* "getKey": a function that returns a cacheKey, giving the same arguments of the decorated function

It logs:
* "memoize-hit" with {key: cache key, result: cache result}

Cache
-----
It is a more sophisticated version of the memoize decorator. It can be used for caching in a db/file etc using memoize-cache (https://github.com/sithmel/memoize-cache). Please use version > 5.0.0. Or memoize-cache-redis > 1.0.0 or memoize-cache-manager > 1.0.0.
```js
var cacheDecorator = require('async-deco/callback/cache');

var cached = cacheDecorator(cache);
var myfunc = cached(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* an "options" object [optional]:

The "options" object may contains:
* an "error" attribute. This can be either an Error constructor function, or a function returning true if the result should be considered an error. The function takes as argument the output of the decorated function: error, result. If the result is an error the returned value is not cached.

It logs:
* "cache-hit" with {key: cache key, result: cache result}
* "cache-error" (when the cache fails) with {cacheErr: error object from the cache}
* "cache-miss" (when the item is not in the cache) with {key: cache key}
* "cache-set" with {args: arguments for caching, res: result to cache}

Purge Cache
-----------
When the decorated function succeed, it purges the corresponding cache entry/entries.
```js
var purgeCacheDecorator = require('async-deco/callback/purge-cache');

var purgeCache = purgeCacheDecorator(cache, opts);
var myfunc = purgeCache(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* an "options" object [optional]:

The "options" object may contains:
* an "error" attribute. This can be either an Error constructor function, or a function returning true if the result should be considered an error. The function takes as argument the output of the decorated function: error, result. If the result is an error the returned value is not cached.
* a "keys" function: this function runs on the arguments of the decorated function and return an array. This array is the list of keys to remove.
* a "tags" function: this function runs on the arguments of the decorated function and return a list of tags. These strings are used as surrogate keys

You can have either "tags" or "keys". Not both.

Proxy
-----
It executes a "guard" function before the original one. If it returns an error it will use this error as the return value of the original function.
It is useful if you want to run a function only if it passes some condition (access control).
```js
var proxyDecorator = require('async-deco/callback/proxy');

var proxy = cacheDecorator(function (..., cb) {
  // calls cb(errorInstance) if the access is denied
  // calls cb() if I can procede calling the function
});
var myfunc = proxy(function (..., cb) { .... });
```
It takes 1 argument:
* a guard function [mandatory]. It takes the same arguments of the original function. If it returns an error (using the callback) the original function won't be called.

It logs "proxy-denied" with { err: error returned by the guard function}

Validator
---------
It uses [occamsrazor-match](https://github.com/sithmel/occamsrazor-match) to perform arguments validation on asynchronous function. It returns an exception if the validation fail. For simpler synchronous functions you can use the decorator included in occamsrazor-match.

```js
var validatorDecorator = require('async-deco/callback/validator');

var validator = validatorDecorator({ name: /[a-zA-Z]/ }, or([false, true]));

var func = validator(function queryUser(user, onlyFirst, cb) {
  ...
});

func({ name: 'Bruce Wayne'}, true, function (err, res) {
  ... this passes the validation
});

func('Bruce Wayne', true, function (err, res) {
  ... this returns an error
});
```
The error returned contains a special "errors" property containing an array of all errors.

Fallback
--------
If a function fails, calls another one
```js
var fallbackDecorator = require('async-deco/callback/fallback');

var fallback = fallbackDecorator(function (a, b, c, func) {
  func(undefined, 'giving up');
}, Error);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 2 arguments:
* fallback function [mandatory]. It takes the same arguments of the original function (and a callback, even in the promise case).
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]

It logs "fallback" with {actualResult: {err: error returned, res: result returned}}

Fallback value
--------------
If a function fails, returns a value
```js
var fallbackValueDecorator = require('async-deco/callback/fallback-value');

var fallback = fallbackValueDecorator('giving up', Error);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 2 arguments:
* fallback value [mandatory]
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]

It logs "fallback" with {actualResult: {err: error returned, res: result returned}}

Fallback cache
--------------
If a function fails, it tries to use a previous cached result.
```js
var fallbackCacheDecorator = require('async-deco/callback/fallback-cache');

var fallback = fallbackCacheDecorator(cache, options);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache). Please use version > 5.0.0. Or memoize-cache-redis > 1.0.0 or memoize-cache-manager > 1.0.0.
* an options object with this optional attributes:
  * error: the error instance for deciding to fallback, or a function taking the error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
  * useStale: if true it will use "stale" cache items as valid [optional, defaults to false]
  * noPush: it true it won't put anything in the cache [optional, defaults to false]

It logs:
* "fallback-cache-hit" with {key: cache key, result: cache object, actualResult: {err: error returned, res: result returned}}
* "fallback-cache-error" with {err: error returned by the function, cacheErr: error returned by the cache}
* "fallback-cache-miss" with {key: cache key, actualResult: {err: error returned, res: result returned}}
* "fallback-cache-set" with {args: arguments for caching, res: result to cache}

Timeout
-------
If a function takes to much, returns a timeout exception.
```js
var timeoutDecorator = require('async-deco/callback/timeout');

var timeout20 = timeoutDecorator(20);
var myfunc = timeout20(function (..., cb) { .... });
```
This will wait 20 ms before returning a TimeoutError.
It takes 1 argument:
* time in ms [mandatory]

It logs "timeout" with { ms: ms passed since the last execution}

Retry
-----
If a function fails, it retry running it again
```js
var retryDecorator = require('async-deco/callback/retry');

var retryTenTimes = retryDecorator(10, 0, Error);
var myfunc = retryTenTimes(function (..., cb) { .... });
```
You can initialise the decorator with 2 arguments:
* number of retries [optional, it defaults to Infinity]
* interval for trying again (number of a function based on the number of times) [optional, it defaults to 0]
* error instance for deciding to retry, or function taking error and result (if it returns true it'll trigger the retry) [optional, it falls back on any error by default]

It logs "retry" with {times: number of attempts, actualResult: {err: original error, res: original result}}

Limit
-----
Limit the concurrency of a function. Every function call that excedees the limit will be queued. If the queue size is reached the function call will return an error.
```js
var limitDecorator = require('async-deco/callback/limit');

var limitToTwo = limitDecorator(2, getKey);
var myfunc = limitToTwo(function (..., cb) { .... });
```
You can initialise the decorator with 1 argument:
* number of parallel execution [default to 1]. It can also be an object: {limit: number, queueSize: number}.
  * "limit" will be the number of parallel execution
  * "queueSize" is the size of the queue (default to Infinity). If the queue reaches this size any further function call will return an error without calling the original function
* a getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue. If it returns null or undefined, the limit will be ignored.
* a getPriority function [optional]: it runs against the original arguments and returns a number that represent the priority of this function when queued (less == prioritary).

It logs "limit-queue" when a function gets queued or "limit-drop" when a function gets rejected (queue full). It'll also log these data: { queueSize: number of function queued, key: cache key, parallel: number of functions currently running }

Atomic
------
The decorated function can't be called concurrently. Here's what happen, in order:
* the "getKey" (passed in the option) is called against the arguments.
    * If the result is null the function call happens normally
    * if getKey is not defined the key is _default (it doesn't take the arguments into consideration)
    * if the result is a string, this will be used as key
* the resource called "key" gets locked
* the decorated function is executed
* the lock "key" is released

The default locking mechanism is very simple and works "in the same process". Its interface is compatible with node-redlock a distributed locking mechanism backed by redis.
```js
var atomicDecorator = require('async-deco/callback/atomic');

var atomic = atomicDecorator(opts);
var myfunc = atomic(function (..., cb) { .... });
```
Options:
* getKey [optional]: a function for calculate a key from the given arguments.
* ttl [optional]: the maximum time to live for the lock. In ms. It defaults to 1000ms.
* lock [optional]: an instance of the locking object. You can pass any object compatible with the Lock instance (node-redlock for example).

```js
var atomicDecorator = require('async-deco/callback/atomic');
var redis = require('redis');
var Redlock = require('redlock');

var client = redis.createClient();
var redlock = new Redlock([client]);
var atomic = atomicDecorator({ lock: redlock, ttl: 1000 });

var atomicFunc = atomic(func);
atomic(..., function (err, res) {
  ...
});
```

Dedupe
------
It executes the original function, while is waiting for the output it doesn't call the function anymore but instead it collects the callbacks.
After getting the result, it dispatches the same to all callbacks.
It may use the "getKey" function to group the callbacks into queues.
```js
var dedupeDecorator = require('async-deco/callback/dedupe');

var dedupe = dedupeDecorator(options);
var myfunc = dedupe(function (..., cb) { .... });
```
Options:
* getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue.
* functionBus [optional]: this object is used to group functions by key and run them. The default implementation is able to group functions belonging to the same process.
* lock [optional]: this object is used to lock a function execution (by key).
* ttl [optional]: the maximum time to live for the lock (in ms). Default to 1000ms.

Using redis backed version of [functionBus](https://github.com/sithmel/function-bus-redis) and [lock](https://github.com/mike-marcacci/node-redlock) it is possible to implement a distributed version of the of the deduplication. Example:
```js
var dedupeDecorator = require('async-deco/callback/dedupe');
var redis = require('redis');
var Lock = require('redis-redlock');
var FunctionBus = require('function-bus-redis');

var lock = new Lock([redis.createClient()]);
var functionBus = new FunctionBus({
  pub: redis.createClient(),
  sub:redis.createClient()
});

var dedupe = dedupeDecorator({
  lock: lock,
  functionBus: functionBus
});

var myfunc = dedupe(function (..., cb) { .... });
```
It logs "dedupe-execute" when a group of callbacks are called.
{key: cache key, len: number of invocations}

Parallel
--------
"parallel" executes every function in parallel. If a function returns an error the execution stops immediatly returning the error.
The functions will get the same arguments and the result will be an array of all the results.
```js
var parallel = require('async-deco/callback/parallel');

var func = parallel([
  function (x, cb) {
    cb(null, x + 1);
  },
  function (x, cb) {
    cb(null, x + 2);
  }
]);

func(3, function (err, values) {
  // values contains  [4, 5]
});
```

Waterfall
---------
"waterfall" executes the functions in series. The first function will get the arguments and the others will use the arguments passed by the previous one:
```js
var waterfall = require('async-deco/callback/waterfall');

var func = waterfall([
  function (x, cb) {
    cb(null, x + ' world');
  },
  function (x, cb) {
    cb(null, x + '!');
  }
]);

func('hello', function (err, value) {
  // value === 'hello world!'
});
```

Race
----
"race" will execute all functions in parallel but it will return the first valid result.
```js
var race = require('async-deco/callback/race');

var func = race([
  function (x, cb) {
    setTimeout(function () {
      cb(null, x + 1);
    }, 20)
  },
  function (x, cb) {
    setTimeout(function () {
      cb(null, x + 2);
    }, 10)
  }
]);

func(3, function (err, values) {
  // values contains  5 (fastest)
});
```

Parallel - Waterfall - Race
---------------------------
It is very easy to combine these functions to create a more complex flow:
```js
var func = waterfall([
  parallel([
    function (x, cb) {
      cb(null, x * 2);
    },
    function (x, cb) {
      cb(null, x * 3);
    }
  ]),
  function (numbers, cb) {
    cb(null, numbers.reduce(function (acc, item) {
      return acc + item;
    }, 0));
  },
  function (x, cb) {
    cb(null, x - 5);
  }
]);

func(5, function (err, value) {
  // value === 20;
});
```
Although these functions are also available for promise, I suggest to use the native promise API, unless you have a better reason for doing differently.

* parallel: Promise.all
* race: Promise.race
* waterfall: just chain different promises

Balance
-------
This decorator allows to distribute the load between a group of functions.
The functions should take the same arguments.
```js
var balance = require('async-deco/callback/balance');

var balanceDecorator = balance();

var func = balanceDecorator([...list of functions]);
func(...args, function (err, res) {
  // ...
});
```
You can initialise the decorator with different policies:
```js
var balance = require('async-deco/callback/balance');
var balancePolicies = require('async-deco/utils/balance-policies');

var balanceDecorator = balance(balancePolicies.roundRobin);
...
```
There are 3 policies available in the "balance-policies" package:

* roundRobin: it rotates the execution between the functions
* random: it picks up a random function
* idlest (default): it tracks the load of each function and use the idlest

You can also define your own policy:
```js
var balance = require('async-deco/callback/balance');

var balanceDecorator = balance(function (counter, loads, args) {
  // "counter" is the number of times I have called the function
  // "loads" is an array with length equal to the number of functions
  //         it contains how many calls are currently running for that function
  // "args" is an array containing the arguments of the current function call
  // this function should return the index of the function I want to run
});
...
```

Debounce
--------
This decorator is a pretty sophisticated version of debounce. In a few words, when a debounced function is called many times within a time interval, it gets executed only once.
It uses the same options of [lodash debounce](https://lodash.com/docs#debounce) (that is used internally), but also allows to have multiple "debounce" contexts.
The decorators takes these arguments:

* wait (mandatory): it is the time interval to debounce
* debounceOpts (optional): the debounce options used by lodash debounce:
  * leading: Specify invoking on the leading edge of the timeout. (default false)
  * trailing: Specify invoking on the trailing edge of the timeout. (default true)
  * maxWait: The maximum time the decorated function is allowed to be delayed before it’s invoked
* getKey (optional): it runs against the original arguments and returns the key used for creating different "debounce" context. If is undefined there will be a single debouncing context. If it returns null there won't be debouncing. Two functions in different contexts aren't influenced each other and are executed independently.
* cacheOpts (optional): the contexts are cached, in this object you can define a maxLen (maximum number of context) and a defaultTTL (contexts last only for this amount of ms).

Example:
```js
var debounce = require('async-deco/callback/debounce');

var debounceDecorator = debounce(1000, { maxWait: 500 }, function (key) { return key; }, { maxLen: 100 });

var func = debounceDecorator(function (key, cb) {
  // this is the function I want to debounce
});

func('r', function (err, res) {
  // the callback is not guaranteed to be called
  // for every execution, being debounced.
});
```

Throttle
--------
This decorator is a pretty sophisticated version of throttle. In a few words, a throttled function can be called only a certain amount of times within a time interval.
It uses the same options of [lodash throttle](https://lodash.com/docs#throttle) (that is used internally), but also allows to have multiple "throttle" contexts.
The decorators takes these arguments:

* wait (mandatory): it is the time interval to throttle
* throttleOpts (optional): the throttle options used by lodash throttle:
  * leading: Specify invoking on the leading edge of the timeout. (default true)
  * trailing: Specify invoking on the trailing edge of the timeout. (default true)
* getKey (optional): it runs against the original arguments and returns the key used for creating different "throttle" context. If is undefined there will be a single debouncing context. If it returns null there won't be throttling. Two functions in different contexts aren't influenced each other and are executed independently.
* cacheOpts (optional): the contexts are cached, in this object you can define a maxLen (maximum number of context) and a defaultTTL (contexts last only for this amount of ms).

Example:
```js
var throttle = require('async-deco/callback/throttle');

var throttleDecorator = throttle(1000, { maxWait: 500 }, function (key) { return key; }, { maxLen: 100 });

var func = throttleDecorator(function (key, cb) {
  // this is the function I want to throttle
});

func('r', function (err, res) {
  // the callback is not guaranteed to be called
  // for every execution, being throttled.
});
```

A note about throttle/debounce. A function that uses these decorators is not guaranteed to be executed every time is called. And the same is true for their callback and promise (yes, there is a promise version!). If you don't need to return a promise, I advice to use the simple callback version.

Utilities
=========

Callbackify
-----------
Convert a synchronous/promise based function to a plain callback.
```js
var callbackify = require('async-deco/utils/callbackify');

var func = callbackify(function (a, b){
  return a + b;
});
func(4, 6, function (err, result){
  ... // result === 10 here
})
```

sanitizeAsyncFunction
---------------------
This special decorator tries to take care of some nasty common cases when you work with "callback based" asynchronous functions.
* if a function calls the callback more than once, the second time it will throw an exception instead
* if a function throws an exception, it will instead call the callback with the error
* if the callback itself throws an exception, it propagates the exception to the calling function
```js
var sanitizeAsyncFunction = require('async-deco/utils/sanitizeAsyncFunction');

var func = sanitizeAsyncFunction(function () {
  throw new Error('generic error');
});

func(function (err, out) {
  // err will be the error
});
```
and
```js
var func = sanitizeAsyncFunction(function () {
  cb(null, 'hello');
  cb(null, 'hello');
});

func(function (err, out) {
  // this will throw an exception instead of being called the second time
});
```

Promisify
---------
Convert a callback based function to a function returning a promise. It is a reference to [es6-promisify](https://www.npmjs.com/package/es6-promisify), exposed here for convenience.
```js
var promisify = require('async-deco/utils/promisify');

var func = promisify(function (a, b, next){
  return next(undefined, a + b);
});
func(4, 6).then(function (result){
  ... // result === 10 here
})
```
You can also use it in an environment where standard "Promise" object is not supported. Just use a polyfill like (https://www.npmjs.com/package/es6-promise).
```js
var Promise = require('es6-promise').Promise;

(function (global) {
global.  Promise = Promise;
}(this));
```
funcRenamer
-----------
It is a decorator that changes the name of the resulting function.
```js
var funcRenamer = require('async-deco/utils/funcRenamer');
var rename = funcRenamer('hello')
var f = rename(function ciao () {})
// f.name === 'hello'
```
It can also decorate the name (setting the second argument to true):
```js
var funcRenamer = require('async-deco/utils/funcRenamer');
var rename = funcRenamer('hello', true)
var f = rename(function world () {})
// f.name === 'hello(world)'
```

Compose
-------
It can combine more than one decorators. You can pass either an array or using multiple arguments. "undefined" items are ignored.
```js
var compose = require('async-deco/utils/compose');

var decorator = compose(
  retryDecorator(10, Error, logger),
  timeoutDecorator(20, logger));

var newfunc = decorator(function (..., cb) { .... });
```
Timeout after 20 ms and then retry 10 times before giving up.
You should consider the last function is the one happen first!
The order in which you compose the decorator changes the way it works, so plan it carefully!
I suggest to:
* put the log decorator as first
* put the fallback decorators before the "timeout" and "retry"
* put the "retry" before the "timeout"
* put "limit" and/or "proxy" as the last one
* put "dedupe", "memoize" or "cache" as last, just before limit/proxy

Decorate
--------
This is a shortcut that allows to compose and decorate in a single instruction:
```js
var decorate = require('async-deco/utils/decorate');

var newfunc = decorate(
  retryDecorator(10, Error, logger),
  timeoutDecorator(20, logger),
  function (..., cb) { .... });
```
The function to decorate has to be the last argument.

Function bus
------------
An object storing functions by key. These can be then executed grouped by key.
It is used to support the "dedupe" decorator.
```js
var FunctionBus = require('async-deco/utils/function-bus');
var functionBus = new FunctionBus();

// queue functions by key
functionBus.queue('a', func1);
functionBus.queue('a', func2);
functionBus.queue('b', func3);

// number of functions queued by key
functionBus.len('a'); // 2
functionBus.len('b'); // 1
functionBus.len('c'); // 0

// execute the 2 functions with key "a"
// passing 3 arguments: 1, 2, 3
functionBus.execute('a', [1, 2, 3]);
```
There is also a distributed version [function-bus-redis](https://github.com/sithmel/function-bus-redis).

Lock
----
A lock object that mimics the API of [node-redlock](https://github.com/mike-marcacci/node-redlock). It is used to support the "dedupe" and "atomic" decorators.

Examples and use cases
======================

Smart memoize/cache
-------------------
Using memoize(or cache) on an asynchronous function has a conceptual flaw. Let's say for example I have a function with 100ms latency. I call this function every 10 ms:
```
executed            ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇          
          ------------------------------
requested ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆
```
What happen is that while I am still waiting for the first result (to cache) I regularly execute other 9 functions.
What if I compose memoize with dedupe?
```js
var decorator = compose(dedupeDecorator(), memoizeDecorator());

var newfunc = decorator(function (..., cb) { .... });
```
dedupe should fill the gap:
```
executed            ⬇
          ------------------------------
requested ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆
```

Reliable function
-----------------
Imagine a case in which you want to be sure you did everything to get a result, and in case is not possible you want to return a sane fallback:
```js
var decorator = compose(
  fallbackDecorator(getFallbackResult), // last resort fallback
  fallbackCacheDecorator(cache),        // try to use a previous cached output
  retryDecorator(3),                    // it retry 3 times
  timeoutDecorator(5000));              // it times out after 5 seconds

var newfunc = decorator(function (..., cb) { .... });
```

Queue
-----
In some case you may want to preserve the sequence used to call a function. For example, sending commands to a db being sure they are executed in the right order.
```js
var limitDecorator = require('async-deco/callback/limit');

var queue = limitDecorator(1);
var myfunc = queue(function (..., cb) { .... });
```
