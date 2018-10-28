var defaultLogger = require('../utils/default-logger')
var LRUCache = require('little-ds-toolkit/lib/lru-cache')
var getErrorCondition = require('./get-error-condition')

function getMemoizeDecorator (wrapper, opts) {
  opts = opts || {}
  if (typeof opts === 'function') {
    opts = { getKey: opts }
  }
  var getKey = opts.getKey || function () { return '_default' }
  var defaultTTL = opts.ttl
  var maxLen = opts.len
  var condition = getErrorCondition(opts.error)
  var cache = new LRUCache({ maxLen: maxLen, defaultTTL: defaultTTL })

  return wrapper(function memoize (func) {
    return function _memoize () {
      var result
      var context = this
      var args = Array.prototype.slice.call(arguments, 0)
      var logger = defaultLogger.apply(context)
      var cb = args[args.length - 1]
      var cacheKey = getKey.apply(context, args)

      args[args.length - 1] = function (err, res) {
        if (cacheKey !== null && !condition(err, res)) {
          cache.set(cacheKey, res)
        }
        cb(err, res)
      }

      if (cacheKey !== null && cache.has(cacheKey)) {
        result = cache.get(cacheKey)
        logger('memoize-hit', { key: cacheKey, result: result })
        return cb(null, result)
      } else {
        func.apply(context, args)
      }
    }
  })
}

module.exports = getMemoizeDecorator
