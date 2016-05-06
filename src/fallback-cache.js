var defaultLogger = require('../utils/default-logger');

function fallbackCacheDecorator(wrapper, cache, opts) {
  var condition;
  opts = opts || {};
  var error = opts.error || Error;
  var useStale = opts.useStale;
  var noPush = opts.noPush;
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
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          cache.query(args, function (e, cacheQuery) {
            if (e) {
              logger('fallback-cache-error', {err: err});          
              cb(err, dep);
            }
            else if (cacheQuery.cached === true && 
            (!cacheQuery.stale || (useStale && cacheQuery.stale))) {
              logger('fallback-cache-hit', {key: cacheQuery.key, result: cacheQuery.hit, actualResult: {err: err, res: dep}});
              cb(null, cacheQuery.hit);
            }
            else {
              cb(err, dep);
            }
          });
        }
        else {
          !noPush && cache.push(args, dep);
          cb(null, dep);
        }
      };

      func.apply(context, args);
    };
  });
}

module.exports = fallbackCacheDecorator;
