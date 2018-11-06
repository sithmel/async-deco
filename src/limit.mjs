import { getLogger } from './add-logger'
import keyGetter from 'memoize-cache-utils/key-getter'
import funcRenamer from './utils/func-renamer'
import FunQueue from 'funqueue-promise'

const returnDefault = () => '_default'

export default function getLimitDecorator (opts = {}) {
  const { concurrency = 1, queueSize, comparator } = opts
  const getKey = keyGetter(opts.getKey || returnDefault)
  const queues = {}

  return function limit (func) {
    const renamer = funcRenamer(`limit(${func.name || 'anonymous'})`)
    return renamer(function _limit (...args) {
      const context = this
      const logger = getLogger(context)
      const cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }

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
