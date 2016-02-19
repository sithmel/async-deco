Callback decorators
===================
This is a collection of function decorators designed to work with functions using callbacks.
The callback must follow the node convention: error, value.
Most of them are designed to make a function call more robust and reliable.
They can be combined together using the "compose" function (included).

About the logger
----------------
Many decorators can have a logger. It is a function with this signature:
```js
function (type, obj)
```
It is called for certain event and it is useful to logging what is happening.

Callbackify
-----------
Convert a synchronous/promise based function to a plain callback.
```js
var callbackify = require('callback-decorators/src/callbackify-decorator');

var func = callbackify(function (a, b){
  return a + b;
});
func(4, 6, function (err, result){
  ... // result === 10 here
})
```

Memoize
-------
It allows to remember the last results
```js
var memoizeDecorator = require('callback-decorators/src/memoize-decorator');

var simpleMemoize = memoizeDecorator(getKey, logger);
simpleMemoize(function (..., cb) { .... });
```
It takes 2 arguments:
* an optional getKey function: when it runs against the original arguments it returns the key used for the caching
* logger function

Fallback
--------
If a function fails, calls another one
```js
var fallbackDecorator = require('callback-decorators/src/fallback-decorator');

var fallback = fallbackDecorator(function (err, a, b, c, func) {
  func(undefined, 'giving up');
}, Error, logger);
fallback(function (..., cb) { .... });
```
It takes 3 arguments:
* fallback function. It takes the err, and the original arguments.
* error instance for deciding to fallback, or a function taking error and result (if it returns true it'll trigger the fallback)
* logger function

Log
---
Logs when a function start, end and fail
```js
ar logDecorator = require('callback-decorators/src/log-decorator');

var addLogs = logDecorator(logger);
addLogs(function (..., cb) { .... });
```

Timeout
-------
If a function takes to much, returns a timeout exception
```js
var timeoutDecorator = require('callback-decorators/src/timeout-decorator');

var timeout20 = timeoutDecorator(20, logger);
timeout20(function (..., cb) { .... });
```
This will wait 20 ms before returning a TimeoutError.
It takes 2 arguments:
* time in ms
* a logger function

Retry
-----
If a function fails it retry
```js
var retryDecorator = require('callback-decorators/src/retry-decorator');

var retryTenTimes = retryDecorator(10, 0, Error, logger);
retryTenTimes(function (..., cb) { .... });
```
You can initialise the decorator with 3 arguments:
* number of retries
* interval for trying again (number of a function based on the number of times)
* error instance for deciding to retry, or function taking error and result (if it returns true it'll trigger the retry)
* logger function

Compose
-------
It can combine more than one decorators.
```js
var compose = require('callback-decorators/src/compose');

var decorator = compose(
  retryDecorator(10, Error, logger),
  timeoutDecorator(20, logger));

decorator(function (..., cb) { .... });
```
Timeout after 20 ms and then retry 10 times before giving up.
You should consider the last function is the one happen first!
