var getLogger = require('./utils/get-logger')
var funcRenamer = require('./utils/func-renamer')

function getProxyDecorator (opts = {}) {
  const guard = opts.guard
  const logger = getLogger(opts.logger)
  return function proxy (func) {
    const renamer = funcRenamer(`proxy(${func.name || 'anonymous'})`)
    return renamer(function _proxy (...args) {
      var context = this

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
