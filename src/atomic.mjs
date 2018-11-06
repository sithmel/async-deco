import { getLogger } from './add-logger'
import keyGetter from 'memoize-cache-utils/key-getter'
import Lock from './utils/lock'
import funcRenamer from './utils/func-renamer'

const returnDefault = () => '_default'

export default function getAtomicDecorator (opts = {}) {
  const getKey = keyGetter(opts.getKey || returnDefault)
  const lockObj = opts.lock || new Lock()
  const ttl = opts.ttl || 1000

  return function atomic (func) {
    const renamer = funcRenamer(`atomic(${func.name || 'anonymous'})`)
    return renamer(function _atomic (...args) {
      const context = this
      const logger = getLogger(context)
      const logError = (err) => err && logger('atomic-lock-error', { error: err })

      const cacheKey = getKey.apply(context, args)

      if (cacheKey == null) {
        return func.apply(context, args)
      }

      return new Promise((resolve, reject) => {
        lockObj.lock(cacheKey, ttl, function (e, lock) {
          logError(e)
          func.apply(context, args)
            .then((res) => {
              lock.unlock(logError)
              resolve(res)
            })
            .catch((e) => {
              lock.unlock(logError)
              reject(e)
            })
        })
      })
    })
  }
}
