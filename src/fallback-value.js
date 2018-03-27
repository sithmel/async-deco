var defaultLogger = require('../utils/default-logger')
var getErrorCondition = require('./get-error-condition')

function getFallbackValueDecorator (wrapper, fallbackVal, error) {
  var condition = getErrorCondition(error)

  return wrapper(function fallbackValue (func) {
    return function _fallbackValue () {
      var context = this
      var args = Array.prototype.slice.call(arguments, 0)
      var logger = defaultLogger.apply(context)
      var cb = args[args.length - 1]

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          logger('fallback', {actualResult: {err: err, res: dep}})
          cb(null, fallbackVal)
        } else {
          cb(err, dep)
        }
      }

      func.apply(context, args)
    }
  })
}

module.exports = getFallbackValueDecorator
