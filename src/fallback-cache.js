var defaultLogger = require('../utils/default-logger');
var getErrorCondition = require('./get-error-condition');

function fallbackCacheDecorator(wrapper, cache, opts) {
  opts = opts || {};
  var error = opts.error || Error;
  var useStale = opts.useStale;
  var noPush = opts.noPush;
  var condition = getErrorCondition(opts.error);

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, res) {
        var key;
        if (condition(err, res)) {
          cache.query(args, function (e, cacheQuery) {
            if (e) {
              logger('fallback-cache-error', {err: err, cacheErr: e});
              cb(err, res);
            }
            else if (cacheQuery.cached === true &&
              (!cacheQuery.stale || (useStale && cacheQuery.stale))) {
              logger('fallback-cache-hit', {timing: cacheQuery.timing, key: cacheQuery.key, result: cacheQuery, actualResult: {err: err, res: res}});
              cb(null, cacheQuery.hit);
            }
            else if (cacheQuery.key === null) { // no cache
              cb(err, res);
            }
            else {
              logger('fallback-cache-miss', {timing: cacheQuery.timing, key: cacheQuery.key, actualResult: {err: err, res: res}});
              cb(err, res);
            }
          });
        }
        else {
          if (!noPush) {
            key = cache.push(args, res);
            if (key) {
              logger('fallback-cache-set', {key: key, args: args, res: res});
            }
          }

          cb(err, res);
        }
      };

      func.apply(context, args);
    };
  });
}

module.exports = fallbackCacheDecorator;
