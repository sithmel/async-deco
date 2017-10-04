require('setimmediate');
var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');
var FunctionBus = require('../utils/function-bus');

function dedupeDecorator(wrapper, getKey, bus) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  bus = bus || new FunctionBus();

  return wrapper(function _dedupeDecorator(func) {

    return function _dedupe() {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);

      if (cacheKey === null) {
        return func.apply(context, args);
      }


      if (!bus.has(cacheKey)) {
        bus.queue(cacheKey, cb);
        // creating callback
        args[args.length - 1] = (function (cacheKey) {
          return function (err, res) {
            bus.execute(cacheKey, [err, res]);
          };
        }(cacheKey));
        func.apply(context, args);
      }
      else {
        bus.queue(cacheKey, cb);
        logger('dedupe-queue', { key: cacheKey });
      }
    };
  });
}

module.exports = dedupeDecorator;
