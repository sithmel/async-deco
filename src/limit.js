var defaultLogger = require('../utils/default-logger')
var keyGetter = require('memoize-cache-utils/key-getter')
var funcRenamer = require('../utils/func-renamer')
const FunQueue = require('funqueue-promise')

const returnDefault = () => '_default'

function getLimitDecorator ({ concurrency = 1, queueSize, getKey, comparator }) {
  getKey = keyGetter(getKey || returnDefault)
  const queues = {}

  return function limit (func) {
    const renamer = funcRenamer(`limit(${func.name || 'anonymous'})`)
    return renamer(function _limit (...args) {
      const context = this
      var logger
      const cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }
      logger = defaultLogger.apply(context)

      if (!queues[cacheKey]) queues[cacheKey] = new FunQueue({ concurrency, queueSize, comparator })

      logger('limit-queue', { key: cacheKey })
      return queues[cacheKey].exec(func.bind(context), args)
        .catch(e => {
          if (e instanceof FunQueue.OverflowError) {
            logger('limit-drop', { key: cacheKey })
          }
          throw e
        })
    })
  }
}

module.exports = getLimitDecorator
