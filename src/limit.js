require('setimmediate');
var LimitError = require('../errors/limit-error');
var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');

function limitDecorator(wrapper, max, getKey) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  max = max || 1;
  var queueSize = Infinity;
  if (typeof max === 'object') {
    queueSize = max.queueSize;
    max = max.limit;
  }
  return wrapper(function (func) {
    var executionNumbers = {};
    var queues = {};

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);

      function runQueues() {
        // should run ALL the queues
        var cacheKey, f;
        for (cacheKey in executionNumbers) {
          if (executionNumbers[cacheKey] >= max) {
            continue;
          }
          f = queues[cacheKey].shift();
          if (f) {
            executionNumbers[cacheKey]++;
            setImmediate(f);
          }
        }
      }

      if (cacheKey == null ) {
        return func.apply(context, args);
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

      if (executionNumbers[cacheKey] < max) {
        executionNumbers[cacheKey]++;
        func.apply(context, args);
      }
      else if (executionNumbers[cacheKey] >= max) {
        if (queues[cacheKey].length >= queueSize) {
          logger('limit-drop', { queueSize: queues[cacheKey].length, parallel: executionNumbers[cacheKey], key: cacheKey });
          cb(new LimitError('Max queue size reached (' + queueSize + ')'));
        }
        else {
          logger('limit-queue', { queueSize:queues[cacheKey].length, parallel: executionNumbers[cacheKey], key: cacheKey });
          queues[cacheKey].push(function () {
            func.apply(context, args);
          });
        }

      }
    };
  });
}

module.exports = limitDecorator;
