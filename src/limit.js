require('setimmediate');
var LimitError = require('../errors/limit-error');
var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');
var TaskQueue = require('../utils/task-queue');

var queueFactory = TaskQueue.queueFactory;
var TaskQueueOverflowError = TaskQueue.TaskQueueOverflowError;

function limitDecorator(wrapper, max, getKey, getPriority) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  max = max || 1;
  var queueSize = Infinity;
  if (typeof max === 'object') {
    queueSize = max.queueSize;
    max = max.limit;
  }
  var executionNumbers = {};
  var queues = {};

  return wrapper(function (func) {

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger;
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
        queues[cacheKey] = queueFactory(getPriority, queueSize);
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
      else {
        try {
          queues[cacheKey].push(func, context, args, cb);
          logger = defaultLogger.apply(context);
          logger('limit-queue', { queueSize: queueSize, parallel: executionNumbers[cacheKey], key: cacheKey });
        }
        catch (e) {
          if (e instanceof TaskQueueOverflowError) {
            logger = defaultLogger.apply(e.item.context);
            logger('limit-drop', { queueSize: queueSize, parallel: executionNumbers[cacheKey], key: cacheKey });
            e.item.cb(new LimitError('Max queue size reached (' + queueSize + ')'));
          }
          else {
            throw e;
          }
        }
      }
    };
  });
}

module.exports = limitDecorator;
