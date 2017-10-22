var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');
var Lock = require('../utils/lock');

function atomicDecorator(wrapper, opts) {
  opts = opts || {};
  var getKey = keyGetter(opts.getKey || function () { return '_default'; });
  var lockObj = opts.lock || new Lock();
  var ttl = opts.ttl || 1000;

  return wrapper(function _atomicDecorator(func) {

    return function _atomic() {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger;
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);

      if (cacheKey == null ) {
        return func.apply(context, args);
      }

      logger = defaultLogger.apply(context);

      var logError = function (err) {
        if (err) {
          logger('atomic-lock-error', { error: err });
        }
      };

      lockObj.lock(cacheKey, ttl, function (e, lock) {
        logError(e);

        args[args.length - 1] = function (err, res) {
          lock.unlock(logError);
          cb(err, res);
        };

        try {
          func.apply(context, args);
        } catch (e) {
          lock.unlock(logError);
          throw e;
        }
      });
    };
  });
}

module.exports = atomicDecorator;
