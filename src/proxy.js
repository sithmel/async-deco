var defaultLogger = require('../utils/default-logger')
var funcRenamer = require('../utils/func-renamer')

function getProxyDecorator (guard) {
  return function proxy (func) {
    const renamer = funcRenamer(`proxy(${func.name || 'anonymous'})`)
    return renamer(function _proxy (...args) {
      var context = this
      var logger = defaultLogger.apply(context)

      return guard.apply(context, args)
        .catch((err) => {
          logger('proxy-denied', { err })
          throw err
        })
        .then(() => func.apply(context, args))
    })
  }
}

module.exports = getProxyDecorator
