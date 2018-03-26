var defaultLogger = require('../utils/default-logger')
var keyGetter = require('memoize-cache-utils/key-getter')
var Lock = require('../utils/lock')
var FunctionBus = require('../utils/function-bus')

function dedupeDecorator (wrapper, opts) {
  opts = opts || {}
  opts = typeof opts === 'function' ? { getKey: opts } : opts
  var getKey = keyGetter(opts.getKey || function () { return '_default' })
  var lockObj = opts.lock || new Lock()
  var functionBus = opts.functionBus || new FunctionBus()
  var ttl = opts.ttl || 1000

  return wrapper(function (func) {
    return function () {
      var context = this
      var args = Array.prototype.slice.call(arguments, 0)
      var logger = defaultLogger.apply(context)
      var cb = args[args.length - 1]
      var cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }

      functionBus.onExecute(function (cacheKey, len) {
        logger('dedupe-execute', { key: cacheKey, len: len })
      })

      functionBus.queue(cacheKey, cb)
      lockObj.lock(cacheKey, ttl, function (e, lock) {
        if (functionBus.len(cacheKey)) {
          args[args.length - 1] = function (err, res) {
            functionBus.execute(cacheKey, [err, res])
            lock.unlock()
          }
          func.apply(context, args)
        } else {
          lock.unlock()
        }
      })
    }
  })
}

module.exports = dedupeDecorator
