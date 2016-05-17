var defaultLogger = require('../utils/default-logger');

function cacheDecorator(wrapper, cache, opts) {
  opts = opts || {};

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      cache.query(args, function (err, cacheQuery) {
        if (err) {
          logger('cache-error', {cacheErr: err});
          func.apply(context, args);
        }
        else if (cacheQuery.cached === true && !cacheQuery.stale) {
          logger('cache-hit', {key: cacheQuery.key, result: cacheQuery});
          cb(null, cacheQuery.hit);
        }
        else {
          logger('cache-miss', {key: cacheQuery.key});
          args[args.length - 1] = function (err, res) {
            if (!err) {
              logger('cache-set', {args: args, res: res});
              cache.push(args, res);
            }
            cb(err, res);
          };
          func.apply(context, args);
        }
      });
    };
  });
}

module.exports = cacheDecorator;
