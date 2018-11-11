import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'
import FunQueue from 'funqueue-promise'

const returnDefault = () => '_default'

export default function getLimitDecorator (opts = {}) {
  const { concurrency = 1, queueSize, comparator } = opts
  const getKey = opts.getKey || returnDefault
  const queues = new Map()

  return function limit (func) {
    if (typeof func !== 'function') throw new Error('limit: should decorate a function')
    const renamer = funcRenamer(`limit(${func.name || 'anonymous'})`)
    return renamer(function _limit (...args) {
      const context = this
      const logger = getLogger(context)
      const cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }

      if (!queues.has(cacheKey)) queues.set(cacheKey, new FunQueue({ concurrency, queueSize, comparator }))

      logger('limit-queue', { key: cacheKey })
      return queues.get(cacheKey).exec(func.bind(context), args)
        .catch(e => {
          if (e instanceof FunQueue.OverflowError) {
            logger('limit-drop', { key: cacheKey })
          }
          throw e
        })
    })
  }
}
