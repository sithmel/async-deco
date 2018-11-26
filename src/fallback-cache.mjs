import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'
import { CacheRAM } from 'memoize-cache'

const always = () => true

export default function getFallbackCacheDecorator (opts = {}) {
  const cache = opts.cache || new CacheRAM(opts)
  const useStale = !!opts.useStale
  const noPush = !!opts.noPush
  const doCacheIf = opts.doCacheIf || always

  return function fallbackCache (func) {
    if (typeof func !== 'function') throw new Error('fallbackCache: should decorate a function')
    const renamer = funcRenamer(`fallbackCache(${func.name || 'anonymous'})`)
    return renamer(function _fallbackCache (...args) {
      const context = this
      const logger = getLogger(context)

      return func.apply(context, args)
        .then((res) => {
          if (!noPush && doCacheIf(res)) {
            const key = cache.push(args, res)
            if (key) {
              logger('fallback-cache-set', { key: key.key, tags: key.tags, args })
            }
          }
          return res
        })
        .catch((err) =>
          new Promise((resolve, reject) => {
            cache.query(args, function (e, cacheQuery) {
              if (e) {
                logger('fallback-cache-error', { err, cacheErr: e })
                reject(err)
              } else if (cacheQuery.cached === true &&
                (!cacheQuery.stale || (useStale && cacheQuery.stale))) {
                logger('fallback-cache-hit', { key: cacheQuery.key, info: cacheQuery, err })
                resolve(cacheQuery.hit)
              } else if (cacheQuery.key === null) { // no cache
                reject(err)
              } else {
                logger('fallback-cache-miss', { key: cacheQuery.key, info: cacheQuery, err })
                reject(err)
              }
            })
          }))
    })
  }
}
