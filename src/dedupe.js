var throttle = require('lodash/throttle');
var noopLogger = require('./noop-logger');

function dedupeDecorator(wrapper, delay, getKey, getlogger) {
  delay = delay || 0;
  getKey = getKey || function () { return '_default'; };
  getlogger = getlogger || noopLogger;

  return wrapper(function (func) {
    var callback_queues = {};
    var functions = {};

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = getlogger.apply(context, args);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args).toString();

      function runQueue(cacheKey, err, dep) {
        var len = cacheKey in callback_queues ? callback_queues[cacheKey].length : 0;
        logger('deduping', {len: len});
        for (var i = 0; i < len; i++) {
          callback_queues[cacheKey][i](err, dep);
        }
        delete callback_queues[cacheKey];
        delete functions[cacheKey];
      }

      if (!(cacheKey in functions)) {
        // creating callback
        args[args.length - 1] = (function (cacheKey) {
          return function (err, dep) {
            runQueue(cacheKey, err, dep);
          };
        }(cacheKey));

        callback_queues[cacheKey] = [];

        functions[cacheKey] = throttle((function (cacheKey) {
          return function () {
            var len = cacheKey in callback_queues ? callback_queues[cacheKey].length : 0;
            if (len) { // callbacks already run, abort!
              func.apply(context, args);
            }
          };
        }(cacheKey)), delay);
      }

      callback_queues[cacheKey].push(cb);
      functions[cacheKey]();
    };
  });
}

module.exports = dedupeDecorator;
