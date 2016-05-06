var defaultLogger = require('../utils/default-logger');

function cacheDecorator(wrapper, cache) {
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, res) {
        if (!err) {
          cache.push(args, res);
        }
        cb(err, res);
      };
      cache.query(args, function (err, cacheQuery) {
        if (err) {
          logger('cache-error', {err: err});          
          func.apply(context, args);
        }
        else if (cacheQuery.cached === true && !cacheQuery.stale) {
          logger('cache-hit', {key: cacheQuery.key, result: cacheQuery.hit});
          cb(null, cacheQuery.hit);
        }
        else {
          func.apply(context, args);
        }
      });
    };
  });
}

module.exports = cacheDecorator;
