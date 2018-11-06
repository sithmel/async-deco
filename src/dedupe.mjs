import { getLogger } from './add-logger'
import keyGetter from 'memoize-cache-utils/key-getter'
import Lock from './utils/lock'
import FunctionBus from './utils/function-bus'
import funcRenamer from './utils/func-renamer'

const returnDefault = () => '_default'

export default function getDedupeDecorator (opts = {}) {
  const getKey = keyGetter(opts.getKey || returnDefault)
  const lockObj = opts.lock || new Lock()
  const functionBus = opts.functionBus || new FunctionBus()
  const ttl = opts.ttl || 1000

  return function dedupe (func) {
    const renamer = funcRenamer(`dedupe(${func.name || 'anonymous'})`)
    return renamer(function _dedupe (...args) {
      const context = this
      const logger = getLogger(context)
      const cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }

      functionBus.onExecute((cacheKey, len) =>
        logger('dedupe-execute', { key: cacheKey, len: len }))

      return new Promise((resolve, reject) => {
        functionBus.queue(cacheKey, resolve, reject)
        lockObj.lock(cacheKey, ttl, function (e, lock) {
          if (functionBus.len(cacheKey)) {
            func.apply(context, args)
              .then((res) => {
                functionBus.execute(cacheKey, null, res)
                lock.unlock()
              })
              .catch((err) => {
                functionBus.execute(cacheKey, err)
                lock.unlock()
              })
          } else {
            lock.unlock()
          }
        })
      })
    })
  }
}
