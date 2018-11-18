import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

const returnEmpty = () => []

export default function getPurgeCacheDecorator (opts = {}) {
  if (!(opts.getKeys || opts.getTags)) {
    throw new Error('purgeCache: you should use getKeys and/or getTags')
  }
  if (!opts.cache) throw new Error('purgeCache: cache argument is mandatory')

  const cache = opts.cache
  const getCacheKeys = opts.getKeys || returnEmpty
  const getTags = opts.getTags || returnEmpty

  return function purgeCache (func) {
    if (typeof func !== 'function') throw new Error('purgeCache: should decorate a function')
    const renamer = funcRenamer(`purgeCache(${func.name || 'anonymous'})`)
    return renamer(function _purgeCache (...args) {
      const context = this
      const logger = getLogger(context)
      const keys = getCacheKeys.apply(context, args)
      const tags = getTags.apply(context, args)

      const callback = function (err) {
        if (err) {
          logger('purge-cache-error', { err })
        } else {
          logger('purge-cache', { tags, keys })
        }
      }

      return func.apply(context, args)
        .then((res) => {
          if (tags && Array.isArray(tags) && tags.length) {
            cache.purgeByTags(tags, callback)
          }
          if (keys && Array.isArray(keys) && keys.length) {
            cache.purgeByKeys(keys, callback)
          }
          return res
        })
    })
  }
}
