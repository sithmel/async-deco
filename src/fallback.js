var getLogger = require('./utils/get-logger')
var funcRenamer = require('./utils/func-renamer')

function getFallbackDecorator (opts = {}) {
  const fallbackFunction = typeof opts.fallback === 'function' ? opts.fallback : () => opts.fallback
  const logger = getLogger(opts.logger)
  return function fallback (func) {
    const renamer = funcRenamer(`fallback(${func.name || 'anonymous'})`)
    return renamer(function _fallback (...args) {
      const context = this

      return func.apply(context, args)
        .catch((err) => {
          logger('fallback', { actualResult: { err: err } })
          return fallbackFunction.apply(context, args)
        })
    })
  }
}

module.exports = getFallbackDecorator
