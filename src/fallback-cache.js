function fallbackCacheDecorator(wrapper, cache, error, logger) {
  var condition;
  error = error || Error;
  logger = logger || function () {};
  if (error === Error || Error.isPrototypeOf(error)) {
    condition = function (err, dep) { return err instanceof error; };
  }
  else {
    condition = error;
  }

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          cache.query(args, function (e, cacheQuery) {
            if (!e && cacheQuery.cached === true) {
              logger('fallback-cachehit', {key: cacheQuery.key, result: cacheQuery.hit, actualResult: {err: err, res: dep}});
              cb(undefined, cacheQuery.hit);
            }
            else {
              cb(err, dep);
            }
          });
        }
        else {
          cache.push(args, dep, function () {
            cb(err, dep);
          });
        }
      };

      func.apply(context, args);
    };
  });
}

module.exports = fallbackCacheDecorator;
