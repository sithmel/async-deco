var defaultLogger = require('../utils/default-logger')

function getProxyDecorator (wrapper, guard) {
  return wrapper(function proxy (func) {
    return function _proxy () {
      var context = this
      var args = Array.prototype.slice.call(arguments, 0)
      var guardArgs = Array.prototype.slice.call(arguments, 0)
      var logger = defaultLogger.apply(context)
      var cb = args[args.length - 1]

      guardArgs[args.length - 1] = function (err) {
        if (err) {
          logger('proxy-denied', {
            err: err
          })
          cb(err)
        } else {
          func.apply(context, args)
        }
      }

      guard.apply(context, guardArgs)
    }
  })
}

module.exports = getProxyDecorator
