import { getLogger } from './add-logger'
import TimeoutError from './errors/timeout-error'
import funcRenamer from './utils/func-renamer'

function throwOnTimeout (ms) {
  return new Promise((resolve, reject) =>
    setTimeout(() =>
      reject(new TimeoutError(`TimeoutError: Service timed out after ${ms.toString()} ms`)), ms))
}

export default function getTimeoutDecorator (opts = {}) {
  const ms = opts.ms
  return function timeout (func) {
    const renamer = funcRenamer(`timeout(${func.name || 'anonymous'})`)
    return renamer(function _timeout (...args) {
      const context = this
      const logger = getLogger(context)
      return Promise.race([func.apply(context, args), throwOnTimeout(ms)])
        .catch((err) => {
          if (err instanceof TimeoutError) {
            logger('timeout', { ms })
          }
          throw err
        })
    })
  }
}
