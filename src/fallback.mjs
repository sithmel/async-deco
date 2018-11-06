import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

export default function getFallbackDecorator (opts = {}) {
  const fallbackFunction = typeof opts.fallback === 'function' ? opts.fallback : () => opts.fallback
  return function fallback (func) {
    const renamer = funcRenamer(`fallback(${func.name || 'anonymous'})`)
    return renamer(function _fallback (...args) {
      const context = this
      const logger = getLogger(context)

      return func.apply(context, args)
        .catch((err) => {
          logger('fallback', { err })
          return fallbackFunction.apply(context, args)
        })
    })
  }
}
