var defaultLogger = require('../utils/default-logger')
var LRUCache = require('little-ds-toolkit/lib/lru-cache')
var funcRenamer = require('../utils/func-renamer')

const returnDefault = () => '_default'

function getMemoizeDecorator (opts) {
  opts = opts || {}
  if (typeof opts === 'function') {
    opts = { getKey: opts }
  }
  var getKey = opts.getKey || returnDefault
  var defaultTTL = opts.ttl
  var maxLen = opts.len
  var cache = new LRUCache({ maxLen: maxLen, defaultTTL: defaultTTL })

  return function memoize (func) {
    const renamer = funcRenamer(`memoize(${func.name || 'anonymous'})`)
    return renamer(function _memoize (...args) {
      var context = this
      var logger = defaultLogger.apply(context)
      var cacheKey = getKey.apply(context, args)

      if (cacheKey === null) {
        return func.apply(context, args)
      }

      if (cache.has(cacheKey)) {
        const result = cache.get(cacheKey)
        logger('memoize-hit', { key: cacheKey, result: result })
        return Promise.resolve(result)
      } else {
        return func.apply(context, args)
          .then((res) => {
            cache.set(cacheKey, res)
            return res
          })
      }
    })
  }
}

module.exports = getMemoizeDecorator
