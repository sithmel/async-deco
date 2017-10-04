require('setimmediate');
var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');
var FunctionBus = require('../utils/function-bus');

function dedupeDecorator(wrapper, getKey, bus) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  bus = bus || new FunctionBus();

  return wrapper(function (func) {

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);

      if (cacheKey === null) {
        return func.apply(context, args);
      }

      bus.queue(cacheKey, cb);

      if (bus.length(cacheKey) === 1) {
        // creating callback
        args[args.length - 1] = (function (cacheKey) {
          return function (err, res) {
            bus.execute(cacheKey, [err, res]);
          };
        }(cacheKey));
        func.apply(context, args);
      }
      else {
        logger('dedupe-queue', { key: cacheKey });
      }
    };
  });
}

module.exports = dedupeDecorator;
