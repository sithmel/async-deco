var noopLogger = require('./noop-logger');

function fallbackCacheDecorator(wrapper, cache, error, getlogger) {
  var condition;
  error = error || Error;
  getlogger = getlogger || noopLogger;
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
      var logger = getlogger.apply(context, args);
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
