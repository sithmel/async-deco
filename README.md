async-deco
==========
[![Build Status](https://travis-ci.org/sithmel/diogenes.svg?branch=master)](https://travis-ci.org/sithmel/diogenes)

This is a collection of function decorators. It allows to timeout, retry, throttle, limit and much more!
They can be combined together using the "compose" function (included).

All decorators are designed to work with functions using a callback or returning a promise. In case of callbacks, it must follow the [node convention](https://docs.nodejitsu.com/articles/errors/what-are-the-error-conventions): the callback should be the last argument and its arguments should be, an error instance and the output of the function.

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
You can pass a logger to the decorators. This function is called with the same arguments of the original function and should return a function with this signature:
```js
function (type, obj)
```
* Type is the type of event to log
* obj contains useful informations, depending on the type

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
It allows to remember the last results
```js
var memoizeDecorator = require('async-deco/callback/memoize');

var simpleMemoize = memoizeDecorator(getKey, logger);
simpleMemoize(function (..., cb) { .... });
```
It takes 2 arguments:
* a getKey function [optional]: when it runs against the original arguments it returns the key used for the caching. If it is missing the function memoize the first result and returns always the same.
* a logger function (logs "cachehit") [optional]

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
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* a logger function (logs "cachehit") [optional]

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
* fallback function [mandatory]. It takes the err, and the original arguments.
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback") [optional]

Fallback value
--------------
If a function fails, returns a value
```js
var fallbackValueDecorator = require('async-deco/callback/fallback-value');

var fallback = fallbackValueDecorator('giving up', Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback value [mandatory]
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback") [optional]

Fallback cache
--------------
If a function fails, it tries to use a previous cached result
```js
var fallbackCacheDecorator = require('async-deco/callback/fallback-cache');

var fallback = fallbackCacheDecorator(cache, Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* a cache object [mandatory]. The interface should be compatible with memoize-cache (https://github.com/sithmel/memoize-cache)
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback) [optional, it falls back on any error by default]
* logger function (logs "fallback-cache") [optional]

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
* time in ms [mandatory]
* a logger function (logs "timeout") [optional]

Retry
-----
If a function fails, it retry running it again
```js
var retryDecorator = require('async-deco/callback/retry');

var retryTenTimes = retryDecorator(10, 0, Error, logger);
retryTenTimes(function (..., cb) { .... });
```
You can initialise the decorator with 3 arguments:
* number of retries [optional, it defaults to Infinity]
* interval for trying again (number of a function based on the number of times) [optional, it defaults to 0]
* error instance for deciding to retry, or function taking error and result (if it returns true it'll trigger the retry) [optional, it falls back on any error by default]
* logger function (logs "retry") [optional]

Limit
-----
Limit the parallel execution of a function.
```js
var limitDecorator = require('async-deco/callback/limit');

var limitToTwo = limitDecorator(2, logger);
limitToTwo(function (..., cb) { .... });
```
You can initialise the decorator with 2 arguments:
* number of parallel execution [mandatory]
* logger function (logs "limit" when a function gets queued) [optional]

Throttle
--------
It throttles or debounces the execution of a function. The callbacks returns normally with the result. Internally it uses the "getKey" function to group the callbacks into queues. It then executes the debounced (or throttled) function. When it returns a value it will run all the callbacks of the same queue.
```js
var debounceDecorator = require('async-deco/callback/debounce');

var debounce = debounceDecorator(100, 'debounce', undefined, undefined, getLogger);
debounce(function (..., cb) { .... });
```
The arguments:
* delay [optional, default 0] the delay before the execution of the function (for debounce) or the number of milliseconds to throttle invocations to.
* timingFunctionName [optional, default "throttle"] it can be the string "throttle" or "debounce"
* options [optional] see below
* getKey
* logger function (logs "deduping" whenever is calling more than one callback with the same results)

The options change meaning if they are related to the "throttle" or the "debounce":

For the debounce:
* leading [default false] (boolean): Specify invoking on the leading edge of the timeout.
* maxWait (number): The maximum time func is allowed to be delayed before it’s invoked.
* trailing [default true] (boolean): Specify invoking on the trailing edge of the timeout.

For the throttle:
* leading [default true] (boolean): Specify invoking on the leading edge of the timeout.
* trailing [default true] (boolean): Specify invoking on the trailing edge of the timeout.

For better understanding of throttle/debounce I suggest to read the "lodash" documentation and this article: https://css-tricks.com/the-difference-between-throttling-and-debouncing/.

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
