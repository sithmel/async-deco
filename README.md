async-deco
==========
[![Build Status](https://travis-ci.org/sithmel/async-deco.svg?branch=master)](https://travis-ci.org/sithmel/async-deco)

async-deco is a collection of decorators. It allows to add features such as timeout, retry, dedupe, limit and much more!
They can be combined together using the "compose" function (included).

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
var decoratedFunction = logDecorator(logger, 'myfunction')(function (a, b, c, next) {
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
var decoratedFunction = logDecorator(logger, 'myfunction')(function (a, b, c) {
  return new Promise(function (resolve, reject) {
    ...
    resolve(result); // or reject(error);    
  });
});
```
Then you can run the decorated function.

Logging
=======
All decorators use a common way to log whatever happens, using the "__log" method in the context (this).
```js
this.__log(name, id, ts, event, payload);
```
This methods is called with the following arguments:
* name: the name passed of the function
* id: an id that changes every time you execute the function
* ts: the time stamp for this event
* evt: the name of the event
* payload: an object with additional information about this event

This method is used only if present and can be also added by the "log" decorator.

This package contains an helper for adding it manually:
```js
var buildLogger = require('async-deco/utils/build-logger');
var context = buildLogger(undefined, 'name', 'id', function (name, id, ts, event, payload) {
});
decoratedFunction.call(context, arg1, arg2, function (err, res) {
  ...  
});
```
If you wish you can use this feature in your own decorators/functions:
```js
var defaultLogger = require('async-deco/utils/default-logger');

function myFunction() {
  var logger = defaultLogger.apply(this);
  ...
  logger('myevent', {... additional info ...});
}
```

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

Log
---
It logs when a function start, end and fail. It also enable the logging for the whole chain of decorators (if combined together).
```js
var logDecorator = require('async-deco/callback/log');

var addLogs = logDecorator(logger, name);
var myfunc = addLogs(function (..., cb) { .... });
```
name: [optional] is a string identifying this composed function.
logger [optional] is a function taking these arguments:
* name: the name passed to the function
* id: a random id that changes every time you execute the function
* ts: the timestamp for this event
* evt: the name of the event
* payload: an object with additional information about this event

For example:
```js
var logDecorator = require('async-deco/callback/log');
var timeoutDecorator = require('async-deco/callback/timeout');
var retryDecorator = require('async-deco/callback/retry');

var decorator = compose(
  logDecorator(function (name, id, ts, evt, payload) {
    console.log(name, id, ts, evt, payload);
  }, 'retry_and_timeout_func'),
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
"retry_and_timeout_func", "asdadfsd", 1459770371655, "start", undefined
"retry_and_timeout_func", "asdadfsd", 1459770371675, "timeout", { ms: 20 }
"retry_and_timeout_func", "asdadfsd", 1459770371675, "retry", { times: 1 }
"retry_and_timeout_func", "asdadfsd", 1459770371695, "timeout", { ms: 20 }
"retry_and_timeout_func", "asdadfsd", 1459770371700, "end", { result: ... }
```
To make this work, the context (this) is extended with a new method __log.
The context attributes and methods are still available through the prototype chain. For this reason inspecting "this" using Object.keys and using this.hasOwnProperty('prop') can return an unexpected result.

Memoize
-------
It caches the result. At any subsequent calls it will return the cached result.
```js
var memoizeDecorator = require('async-deco/callback/memoize');

var simpleMemoize = memoizeDecorator(getKey);
var myfunc = simpleMemoize(function (..., cb) { .... });
```
It takes 1 argument:
* a getKey function [optional]: it runs against the original arguments and returns the key used for the caching. If it is missing, only one result will be memoized.

It logs "cachehit" with {key: cache key, result: cache result}

Cache
-----
It is a more sophisticated version of the memoize decorator. It can be used for caching in a db/file etc using memoize-cache (https://github.com/sithmel/memoize-cache).
```js
var cacheDecorator = require('async-deco/callback/cache');

var cached = cacheDecorator(cache);
var myfunc = cached(function (..., cb) { .... });
```
It takes 1 argument:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)

It logs "cachehit" with {key: cache key, result: cache result}.

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

It logs "access denied" with { err: error returned by the guard function}

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

var fallback = fallbackCacheDecorator(cache, Error);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* error instance for deciding to fallback, or a function taking the error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]

It logs "fallback-cache" with {key: cache key, result: cache result, actualResult: {err: error returned, res: result returned}}

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
Limit the concurrency of a function.
```js
var limitDecorator = require('async-deco/callback/limit');

var limitToTwo = limitDecorator(2, getKey);
var myfunc = limitToTwo(function (..., cb) { .... });
```
You can initialise the decorator with 1 argument:
* number of parallel execution [mandatory]
* a getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue.

It logs "limit" when a function gets queued with { number: number of function queued, key: cache key }

Dedupe
------
It executes the original function, while is waiting for the output it doesn't call the function anymore but instead it collects the callbacks.
After getting the result, it dispatches the same to all callbacks.
It may use the "getKey" function to group the callbacks into queues.
```js
var dedupeDecorator = require('async-deco/callback/dedupe');

var dedupe = dedupeDecorator(getKey);
var myfunc = dedupe(function (..., cb) { .... });
```
The argument:
* getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue.

It logs "deduping" whenever is calling more than one callback with the same results.
{len: number of function call saved, key: cache key}

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

Promisify
---------
Convert a callback based function to a function returning a promise. (It uses https://www.npmjs.com/package/es6-promisify)
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
