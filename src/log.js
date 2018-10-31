var defaultLogger = require('../utils/default-logger')
var funcRenamer = require('../utils/func-renamer')

function getLogDecorator (prefix = '') {
  return function log (func) {
    const renamer = funcRenamer(`log${prefix}(${func.name || 'anonymous'})`)
    return renamer(function _log (...args) {
      var context = this
      var logger = defaultLogger.apply(context)
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
