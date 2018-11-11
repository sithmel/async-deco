import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

export default function getGuardDecorator (opts = {}) {
  const check = opts.check
  if (typeof check !== 'function') throw new Error('guard: the check argument is mandatory')
  return function guard (func) {
    if (typeof func !== 'function') throw new Error('guard: should decorate a function')
    const renamer = funcRenamer(`guard(${func.name || 'anonymous'})`)
    return renamer(function _guard (...args) {
      const context = this
      const logger = getLogger(context)

      return Promise.resolve()
        .then(() => check.apply(context, args))
        .catch((err) => {
          logger('guard-denied', { err })
          throw err
        })
        .then(() => func.apply(context, args))
    })
  }
}
