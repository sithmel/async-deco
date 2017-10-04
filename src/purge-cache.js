var defaultLogger = require('../utils/default-logger');
var getErrorCondition = require('./get-error-condition');
var keysGetter = require('memoize-cache-utils/keys-getter');

function purgeCacheDecorator(wrapper, cache, opts) {
  opts = opts || {};
  var condition = getErrorCondition(opts.error);
  var getCacheKeys = keysGetter(opts.keys);
  var getTags = keysGetter(opts.tags);

  return wrapper(function _purgeCacheDecorator(func) {
    return function _purgeCache() {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var keys = getCacheKeys.apply(this, args);
      var tags = getTags.apply(this, args);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      var catchingError = function (err) {
        if (err) logger('purge-cache-error', { cacheErr: err });
        return !!err;
      };

      args[args.length - 1] = function (err, res) {
        if (!condition(err, res)) {
          if (tags && Array.isArray(tags) && tags.length) {
            cache.purgeByTags(tags, function () {
              if (!catchingError(err)) logger('purge-cache', { tags: tags });
            });
          } else if (keys && Array.isArray(keys) && keys.length) {
            cache.purgeByKeys(keys, function () {
              if (!catchingError(err)) logger('purge-cache', { keys: keys });
            });
          }
        } else {
          logger('purge-cache-miss', { err: err, res: res });
        }
        cb(err, res);
      };
      func.apply(context, args);
    };
  });
}

module.exports = purgeCacheDecorator;
