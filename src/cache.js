function cacheDecorator(wrapper, cache, logger) {
  logger = logger || function () {};

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (!err) {
          cache.push(args, dep, function () {
            cb(err, dep);
          });
        }
        else {
          cb(err, dep);
        }
      };

      cache.query(args, function (err, cacheQuery) {
        if (!err && cacheQuery.cached === true) {
          logger('cachehit', {key: cacheQuery.key, result: cacheQuery.hit});
          cb(undefined, cacheQuery.hit);
        }
        else {
          func.apply(context, args);
        }
      });
    };
  });
}

module.exports = cacheDecorator;