var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');

function memoizeDecorator(wrapper, getKey) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  var cache = {};

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args);
      args[args.length - 1] = function (err, dep) {
        if (!err && cacheKey !== null) {
          cache[cacheKey] = dep;
        }
        cb(err, dep);
      };
      if (cacheKey !== null && cacheKey in cache) {
        logger('memoize-hit', {key: cacheKey, result: cache[cacheKey]});
        return cb(null, cache[cacheKey]);
      }
      else {
        func.apply(context, args);
      }
    };
  });
}

module.exports = memoizeDecorator;
