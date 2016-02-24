var throttle = require('lodash/throttle');
var debounce = require('lodash/debounce');
var noopLogger = require('./noop-logger');

var timingFunc = {
  throttle: throttle,
  debounce: debounce,
};

function debounceDecorator(wrapper, delay, timingFuncName, options, getKey, getlogger) {
  delay = delay || 0;
  timingFuncName = (timingFuncName === 'throttle') ||
                   (timingFuncName === 'debounce') ? timingFuncName : 'throttle';

  options = options || {};
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

        functions[cacheKey] = timingFunc[timingFuncName](function () {
          func.apply(context, args);
        }, delay, options);
      }

      callback_queues[cacheKey].push(cb);
      functions[cacheKey]();
    };
  });
}

module.exports = debounceDecorator;
