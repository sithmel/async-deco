import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

export default function getLogDecorator (opts = {}) {
  const prefix = opts.prefix || ''
  return function log (func) {
    if (typeof func !== 'function') throw new Error('log: should decorate a function')
    const renamer = funcRenamer(`log${prefix}(${func.name || 'anonymous'})`)
    return renamer(function _log (...args) {
      const context = this
      const logger = getLogger(context)

      logger(prefix + 'log-start', {})
      return func.apply(context, args)
        .then((res) => {
          logger(prefix + 'log-end', { res })
          return res
        })
        .catch((err) => {
          logger(prefix + 'log-error', { err })
          throw err
        })
    })
  }
}
