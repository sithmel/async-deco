var TimeoutError = require('./errors/timeout-error')
var defaultLogger = require('./utils/default-logger')
var funcRenamer = require('./utils/func-renamer')

function throwOnTimeout (ms) {
  return new Promise((resolve, reject) =>
    setTimeout(() =>
      reject(new TimeoutError(`TimeoutError: Service timed out after ${ms.toString()} ms`)), ms))
}

function getTimeoutDecorator (ms) {
  return function timeout (func) {
    const renamer = funcRenamer(`timeout(${func.name || 'anonymous'})`)
    return renamer(function _timeout (...args) {
      var context = this
      var logger = defaultLogger.apply(context)
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

module.exports = getTimeoutDecorator
