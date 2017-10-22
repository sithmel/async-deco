require('setimmediate');
var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');

function dedupeDecorator(wrapper, getKey) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  var callback_queues = {};

  return wrapper(function (func) {

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);

      function runQueue(cacheKey, err, dep) {
        var len = cacheKey in callback_queues ? callback_queues[cacheKey].length : 0;
        for (var i = 0; i < len; i++) {
          setImmediate((function (f) {
            return function () {
              f(err, dep);
            };
          })(callback_queues[cacheKey][i]), 0);
        }
        delete callback_queues[cacheKey];
      }

      if (cacheKey == null) {
        func.apply(context, args);
      }
      else if (!(cacheKey in callback_queues)) {
        // creating callback
        args[args.length - 1] = (function (cacheKey) {
          return function (err, dep) {
            runQueue(cacheKey, err, dep);
          };
        }(cacheKey));
        callback_queues[cacheKey] = [cb];
        func.apply(context, args);
      }
      else {
        logger('dedupe-queue', {key: cacheKey});
        callback_queues[cacheKey].push(cb);
      }
    };
  });
}

module.exports = dedupeDecorator;
