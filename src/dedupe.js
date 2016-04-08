var defaultLogger = require('../utils/default-logger');

function dedupeDecorator(wrapper, getKey) {
  getKey = getKey || function () { return '_default'; };

  return wrapper(function (func) {
    var callback_queues = {};

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args).toString();

      function runQueue(cacheKey, err, dep) {
        var len = cacheKey in callback_queues ? callback_queues[cacheKey].length : 0;
        if (len > 1) {
          logger('deduping', {len: len, key: cacheKey});
        }
        for (var i = 0; i < len; i++) {
          callback_queues[cacheKey][i](err, dep);
        }
        delete callback_queues[cacheKey];
      }

      if (!(cacheKey in callback_queues)) {
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
        callback_queues[cacheKey].push(cb);
      }
    };
  });
}

module.exports = dedupeDecorator;
