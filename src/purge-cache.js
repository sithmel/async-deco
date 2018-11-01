var defaultLogger = require('./utils/default-logger')
var keysGetter = require('memoize-cache-utils/keys-getter')
var funcRenamer = require('./utils/func-renamer')

function getPurgeCacheDecorator (cache, opts) {
  opts = opts || {}
  var getCacheKeys = keysGetter(opts.keys)
  var getTags = keysGetter(opts.tags)

  return function purgeCache (func) {
    const renamer = funcRenamer(`purgeCache(${func.name || 'anonymous'})`)
    return renamer(function _purgeCache (...args) {
      var context = this
      var keys = getCacheKeys.apply(context, args)
      var tags = getTags.apply(context, args)
      var logger = defaultLogger.apply(context)

      const callback = function (err) {
        if (err) {
          logger('purge-cache-error', { cacheErr: err })
        } else {
          logger('purge-cache', { tags, keys })
        }
      }

      return func.apply(context, args)
        .then((res) => {
          if (tags && Array.isArray(tags) && tags.length) {
            cache.purgeByTags(tags, callback)
          } else if (keys && Array.isArray(keys) && keys.length) {
            cache.purgeByKeys(keys, callback)
          }
          return res
        })
        .catch((err) => {
          logger('purge-cache-miss', { err: err })
          throw err
        })
    })
  }
}

module.exports = getPurgeCacheDecorator
