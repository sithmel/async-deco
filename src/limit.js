require('setimmediate');
var defaultLogger = require('../utils/default-logger');

function limitDecorator(wrapper, max, getKey) {
  getKey = getKey || function () { return '_default'; };

  return wrapper(function (func) {
    var executionNumbers = {};
    var queues = {};

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args).toString();

      function runQueues() {
        // should run ALL the queues
        var cacheKey, f;
        for (cacheKey in executionNumbers) {
          if (executionNumbers[cacheKey] >= max) {
            logger('limit', { number: executionNumbers[cacheKey], key: cacheKey });
            continue;
          }
          f = queues[cacheKey].shift();
          if (f) {
            executionNumbers[cacheKey]++;
            setImmediate(f);
          }
        }
      }


      if (!(cacheKey in executionNumbers)) {
        executionNumbers[cacheKey] = 0;
        queues[cacheKey] = [];
      }

      args[args.length - 1] = function (err, dep) {
        executionNumbers[cacheKey]--;
        runQueues();
        if (executionNumbers[cacheKey] === 0) {
          delete executionNumbers[cacheKey];
          delete queues[cacheKey];
        }
        cb(err, dep);
      };

      queues[cacheKey].push(function () {
        func.apply(context, args);
      });
      runQueues();
    };
  });
}

module.exports = limitDecorator;
