import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

export default function getProxyDecorator (opts = {}) {
  const guard = opts.guard
  return function proxy (func) {
    const renamer = funcRenamer(`proxy(${func.name || 'anonymous'})`)
    return renamer(function _proxy (...args) {
      const context = this
      const logger = getLogger(context)

      return guard.apply(context, args)
        .catch((err) => {
          logger('proxy-denied', { err })
          throw err
        })
        .then(() => func.apply(context, args))
    })
  }
}
