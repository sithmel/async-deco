var defaultLogger = require('../utils/default-logger')
var getErrorCondition = require('./get-error-condition')
var funcRenamer = require('../utils/func-renamer')

function getFallbackDecorator (fallbackFunction, opts = {}) {
  const condition = getErrorCondition(opts.error)

  return function fallback (func) {
    const renamer = funcRenamer(`fallback(${func.name || 'anonymous'})`)
    return renamer(function _fallback (...args) {
      const context = this
      const logger = defaultLogger.apply(context)

      return func.apply(context, args)
        .catch((err) => {
          if (condition(err)) {
            logger('fallback', {actualResult: {err: err}})
            return fallbackFunction.apply(context, args)
          }
          throw err
        })
    })
  }
}

module.exports = getFallbackDecorator
