function memoizeDecorator(wrapper, getKey, logger) {
  var cache = {};
  logger = logger || function () {};
  getKey = getKey || function () { return '_default'; };
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
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
