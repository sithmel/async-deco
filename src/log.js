var getLogger = require('./utils/get-logger')
var funcRenamer = require('./utils/func-renamer')

function getLogDecorator (opts = {}) {
  const prefix = opts.prefix || ''
  const logger = getLogger(opts.logger)
  return function log (func) {
    const renamer = funcRenamer(`log${prefix}(${func.name || 'anonymous'})`)
    return renamer(function _log (...args) {
      logger(prefix + 'log-start', {})
      return func.apply(this, args)
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
