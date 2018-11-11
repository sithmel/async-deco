import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

export default function getFallbackDecorator (opts = {}) {
  if ('value' in opts && 'func' in opts) {
    throw new Error('fallback: you can either fallback on a function (func) or a value')
  }
  if (!('value' in opts || 'func' in opts)) {
    throw new Error('fallback: you can either fallback on a function (func) or a value')
  }
  const fallbackFunction = 'value' in opts ? () => opts.value : opts.func
  return function fallback (func) {
    if (typeof func !== 'function') throw new Error('fallback: should decorate a function')
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
