var addLogger = require('./add-logger')
var funcRenamer = require('./utils/func-renamer')

function getFallbackDecorator (opts = {}) {
  const fallbackFunction = typeof opts.fallback === 'function' ? opts.fallback : () => opts.fallback
  return function fallback (func) {
    const renamer = funcRenamer(`fallback(${func.name || 'anonymous'})`)
    return renamer(function _fallback (...args) {
      const context = this
      const logger = addLogger.getLogger(context)

      return func.apply(context, args)
        .catch((err) => {
          logger('fallback', { actualResult: { err: err } })
          return fallbackFunction.apply(context, args)
        })
    })
  }
}

module.exports = getFallbackDecorator
