var defaultLogger = require('../utils/default-logger');
var getErrorCondition = require('./get-error-condition');

function cacheDecorator(wrapper, cache, opts) {
  opts = opts || {};
  var condition = getErrorCondition(opts.error);

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      cache.query(args, function (err, cacheQuery) {
        var key;
        if (err) {
          logger('cache-error', {cacheErr: err});
          func.apply(context, args);
        }
        else if (cacheQuery.cached === true && !cacheQuery.stale) {
          logger('cache-hit', {key: cacheQuery.key, result: cacheQuery, timing: cacheQuery.timing});
          cb(null, cacheQuery.hit);
        }
        else if (cacheQuery.key === null) { // no cache
          func.apply(context, args);
        }
        else {
          logger('cache-miss', {key: cacheQuery.key, timing: cacheQuery.timing});
          args[args.length - 1] = function (err, res) {
            if (!condition(err, res)) {
              key = cache.push(args, res);
              if (key) {
                logger('cache-set', {key: key, args: args, res: res});
              }
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
