var defaultLogger = require('./default-logger');

function memoizeDecorator(wrapper, getKey) {
  getKey = getKey || function () { return '_default'; };
  return wrapper(function (func) {
    var cache = {};
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var cacheKey = getKey.apply(context, args).toString();
      args[args.length - 1] = function (err, dep) {
        if (!err) {
          cache[cacheKey] = dep;
        }
        cb(err, dep);
      };
      if (cacheKey in cache) {
        logger('cachehit', {key: cacheKey, result: cache[cacheKey]});
        return cb(undefined, cache[cacheKey]);
      }
      else {
        func.apply(context, args);
      }
    };
  });
}

module.exports = memoizeDecorator;
