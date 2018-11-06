var addLogger = require('./add-logger')
var funcRenamer = require('./utils/func-renamer')

function getLogDecorator (opts = {}) {
  const prefix = opts.prefix || ''
  return function log (func) {
    const renamer = funcRenamer(`log${prefix}(${func.name || 'anonymous'})`)
    return renamer(function _log (...args) {
      const context = this
      const logger = addLogger.getLogger(context)

      logger(prefix + 'log-start', {})
      return func.apply(context, args)
        .then((res) => {
          logger(prefix + 'log-end', { result: res })
          return res
        })
        .catch((err) => {
          logger(prefix + 'log-error', { err: err })
          throw err
        })
    })
  }
}

module.exports = getLogDecorator
