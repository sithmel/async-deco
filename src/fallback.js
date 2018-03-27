var defaultLogger = require('../utils/default-logger')
var getErrorCondition = require('./get-error-condition')

function getFallbackDecorator (wrapper, fallbackFunction, error) {
  var condition = getErrorCondition(error)

  return wrapper(function fallback (func) {
    return function _fallback () {
      var context = this
      var args = Array.prototype.slice.call(arguments, 0)
      var logger = defaultLogger.apply(context)
      var cb = args[args.length - 1]

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          logger('fallback', {actualResult: {err: err, res: dep}})
          fallbackFunction.apply(context, args.slice(0, -1).concat(cb))
        } else {
          cb(err, dep)
        }
      }

      func.apply(context, args)
    }
  })
}

module.exports = getFallbackDecorator
