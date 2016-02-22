async-deco
==========
This is a collection of function decorators designed to work with functions using a callback or returning a promise.
In case of callbacks, it must follow the [node convention](https://docs.nodejitsu.com/articles/errors/what-are-the-error-conventions): the callback should be the last argument and its arguments should be, an error instance and the output of the function.
Most of them are designed to make an asynchronous function call more robust and reliable.
They can be combined together using the "compose" function (included).

Callback and promises
=====================
Every decorator is available in two different flavours:
* callback based:
```js
var logDecorator = require('async-deco/callback/log');
```
This should be applied to functions with the node callback convention:
```js
logDecorator(logger)(function (a, b, c, next) {
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
logDecorator(logger)(function (a, b, c) {
  return new Promise(function (resolve, reject) {
    ...
    resolve(result); // or reject(error);    
  });
});
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

About the logger
----------------
You can pass a logger to the decorators. It is a function with this signature:
```js
function (type, obj)
```
* Type is the type of event to log
* obj contains useful informations, depending on the type

Decorators
==========
The examples are related to the callback version. Just import the promise version in case of decorating promise based functions.

Memoize
-------
It allows to remember the last results
```js
var memoizeDecorator = require('async-deco/callback/memoize');

var simpleMemoize = memoizeDecorator(getKey, logger);
simpleMemoize(function (..., cb) { .... });
```
It takes 2 arguments:
* an optional getKey function: when it runs against the original arguments it returns the key used for the caching
* a logger function (logs "cachehit")

Cache
-----
It is a more sophisticated version of the memoize decorator. It can be used to for caching in a db/file etc (You may have to write your own cache object).
memoize-cache is an in-memory reference implementation (https://github.com/sithmel/memoize-cache).
```js
var cacheDecorator = require('async-deco/callback/cache');

var cached = cacheDecorator(cache, logger);
cached(function (..., cb) { .... });
```
It takes 2 arguments:
* a cache object. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* a logger function (logs "cachehit")

Fallback
--------
If a function fails, calls another one
```js
var fallbackDecorator = require('async-deco/callback/fallback');

var fallback = fallbackDecorator(function (err, a, b, c, func) {
  func(undefined, 'giving up');
}, Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback function. It takes the err, and the original arguments.
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback)
* logger function (logs "fallback")

Fallback value
--------------
If a function fails, returns a value
```js
var fallbackValueDecorator = require('async-deco/callback/fallback-value');

var fallback = fallbackValueDecorator('giving up', Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback value.
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback)
* logger function (logs "fallback")

Fallback cache
--------------
If a function fails, it tries to use a previous cached result
```js
var fallbackCacheDecorator = require('async-deco/callback/fallback-cache');

var fallback = fallbackCacheDecorator(cache, Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* a cache object. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback)
* logger function (logs "fallback-cache")

Log
---
Logs when a function start, end and fail
```js
ar logDecorator = require('async-deco/callback/log');

var addLogs = logDecorator(logger);
addLogs(function (..., cb) { .... });
```

Timeout
-------
If a function takes to much, returns a timeout exception
```js
var timeoutDecorator = require('async-deco/callback/timeout');

var timeout20 = timeoutDecorator(20, logger);
timeout20(function (..., cb) { .... });
```
This will wait 20 ms before returning a TimeoutError.
It takes 2 arguments:
* time in ms
* a logger function (logs "timeout")

Retry
-----
If a function fails, it retry running it again
```js
var retryDecorator = require('async-deco/callback/retry');

var retryTenTimes = retryDecorator(10, 0, Error, logger);
retryTenTimes(function (..., cb) { .... });
```
You can initialise the decorator with 3 arguments:
* number of retries
* interval for trying again (number of a function based on the number of times)
* error instance for deciding to retry, or function taking error and result (if it returns true it'll trigger the retry)
* logger function (logs "retry")

Limit
-----
Limit the parallel execution of a function.
```js
var limitDecorator = require('async-deco/callback/limit');

var limitToTwo = limitDecorator(2, logger);
limitToTwo(function (..., cb) { .... });
```
You can initialise the decorator with 2 arguments:
* number of parallel execution
* logger function (logs "limit" when a function gets queued)

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
It can combine more than one decorators. You can pass either an array or using multiple arguments. "undefined" functions are ignored.
```js
var compose = require('async-deco/utils/compose');

var decorator = compose(
  retryDecorator(10, Error, logger),
  timeoutDecorator(20, logger));

decorator(function (..., cb) { .... });
```
Timeout after 20 ms and then retry 10 times before giving up.
You should consider the last function is the one happen first!
