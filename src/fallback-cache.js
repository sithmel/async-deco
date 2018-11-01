var defaultLogger = require('./utils/default-logger')
var getErrorCondition = require('./get-error-condition')
var funcRenamer = require('./utils/func-renamer')

function getFallbackCacheDecorator (cache, opts = {}) {
  const useStale = opts.useStale
  const noPush = opts.noPush
  const isValidError = getErrorCondition(opts.error)

  return function fallbackCache (func) {
    const renamer = funcRenamer(`fallbackCache(${func.name || 'anonymous'})`)
    return renamer(function _fallbackCache (...args) {
      const context = this
      const logger = defaultLogger.apply(context)

      return func.apply(context, args)
        .then((res) => {
          if (!noPush) {
            const key = cache.push(args, res)
            if (key) {
              logger('fallback-cache-set', { key: key.key, tags: key.tags, args: args, res: res })
            }
          }
          return res
        })
        .catch((err) => {
          if (!isValidError(err)) throw err
          return new Promise((resolve, reject) => {
            cache.query(args, function (e, cacheQuery) {
              if (e) {
                logger('fallback-cache-error', { err: err, cacheErr: e })
                reject(err)
              } else if (cacheQuery.cached === true &&
                (!cacheQuery.stale || (useStale && cacheQuery.stale))) {
                logger('fallback-cache-hit', { timing: cacheQuery.timing, key: cacheQuery.key, result: cacheQuery, actualResult: { err: err } })
                resolve(cacheQuery.hit)
              } else if (cacheQuery.key === null) { // no cache
                reject(err)
              } else {
                logger('fallback-cache-miss', { timing: cacheQuery.timing, key: cacheQuery.key, actualResult: { err: err } })
                reject(err)
              }
            })
          })
        })
    })
  }
}

module.exports = getFallbackCacheDecorator
