async-deco
==========
[![Build Status](https://travis-ci.org/sithmel/diogenes.svg?branch=master)](https://travis-ci.org/sithmel/diogenes)

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

About the logger
----------------
You can pass a logger to any decorators. This function is called with the same arguments of the original function and should return a function with this signature:
```js
function (type, obj)
```
* Type is the type of event to log
* obj contains useful informations, depending on the type of the decorator

So for example, assuming that the first argument of the decorated function is a name:
```js
var logger = function (name) {
  return function (type, obj) {
    console.log(name + ': ' + type);
  };
};
```

Decorators
==========
The examples are related to the callback version. Just import the promise version in case of decorating promise based functions.

Memoize
-------
It caches the result. At any subsequent calls it will return the cached result.
```js
var memoizeDecorator = require('async-deco/callback/memoize');

var simpleMemoize = memoizeDecorator(getKey, logger);
var myfunc = simpleMemoize(function (..., cb) { .... });
```
It takes 2 arguments:
* a getKey function [optional]: it runs against the original arguments and returns the key used for the caching. If it is missing, only one result will be memoized.
* a logger function (logs "cachehit") [optional]

Cache
-----
It is a more sophisticated version of the memoize decorator. It can be used for caching in a db/file etc (You may have to write your own cache object).
memoize-cache is an in-memory reference implementation (https://github.com/sithmel/memoize-cache).
```js
var cacheDecorator = require('async-deco/callback/cache');

var cached = cacheDecorator(cache, logger);
var myfunc = cached(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* a logger function (logs "cachehit") [optional]

Fallback
--------
If a function fails, calls another one
```js
var fallbackDecorator = require('async-deco/callback/fallback');

var fallback = fallbackDecorator(function (a, b, c, func) {
  func(undefined, 'giving up');
}, Error, logger);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback function [mandatory]. It takes the same arguments of the original function (and a callback, even in the promise case).
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback") [optional]

Fallback value
--------------
If a function fails, returns a value
```js
var fallbackValueDecorator = require('async-deco/callback/fallback-value');

var fallback = fallbackValueDecorator('giving up', Error, logger);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback value [mandatory]
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback") [optional]

Fallback cache
--------------
If a function fails, it tries to use a previous cached result.
```js
var fallbackCacheDecorator = require('async-deco/callback/fallback-cache');

var fallback = fallbackCacheDecorator(cache, Error, logger);
var myfunc = fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* error instance for deciding to fallback, or a function taking the error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback-cache") [optional]

Log
---
Logs when a function start, end and fail
```js
ar logDecorator = require('async-deco/callback/log');

var addLogs = logDecorator(logger);
var myfunc = addLogs(function (..., cb) { .... });
```

Timeout
-------
If a function takes to much, returns a timeout exception.
```js
var timeoutDecorator = require('async-deco/callback/timeout');

var timeout20 = timeoutDecorator(20, logger);
var myfunc = timeout20(function (..., cb) { .... });
```
This will wait 20 ms before returning a TimeoutError.
It takes 2 arguments:
* time in ms [mandatory]
* a logger function (logs "timeout") [optional]

Retry
-----
If a function fails, it retry running it again
```js
var retryDecorator = require('async-deco/callback/retry');

var retryTenTimes = retryDecorator(10, 0, Error, logger);
var myfunc = retryTenTimes(function (..., cb) { .... });
```
You can initialise the decorator with 3 arguments:
* number of retries [optional, it defaults to Infinity]
* interval for trying again (number of a function based on the number of times) [optional, it defaults to 0]
* error instance for deciding to retry, or function taking error and result (if it returns true it'll trigger the retry) [optional, it falls back on any error by default]
* logger function (logs "retry") [optional]

Limit
-----
Limit the concurrency of a function.
```js
var limitDecorator = require('async-deco/callback/limit');

var limitToTwo = limitDecorator(2, getKey,logger);
var myfunc = limitToTwo(function (..., cb) { .... });
```
You can initialise the decorator with 2 arguments:
* number of parallel execution [mandatory]
* a getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue.
* logger function (logs "limit" when a function gets queued) [optional]

Dedupe
------
It executes the original function, while is waiting for the output it doesn't call the function anymore but instead it collects the callbacks.
After getting the result, it dispatches the same to all callbacks.
It may use the "getKey" function to group the callbacks into queues.
```js
var dedupeDecorator = require('async-deco/callback/dedupe');

var dedupe = dedupeDecorator(getKey, getLogger);
var myfunc = dedupe(function (..., cb) { .... });
```
The arguments:
* getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue.
* logger function (logs "deduping" whenever is calling more than one callback with the same results)

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
