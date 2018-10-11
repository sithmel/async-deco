var defaultLogger = require('../utils/default-logger')
var balancePolicies = require('../utils/balance-policies')

function getBalanceDecorator (policy = balancePolicies.idlest) {
  return function balance (funcs) {
    const loads = funcs.map(function () { return 0 })
    let executionNumber = 0

    return function _balance (...args) {
      const context = this
      const logger = defaultLogger.apply(context)

      // var cb = args[args.length - 1]
      var selected = policy.call(context, executionNumber++, loads, args)
      loads[selected]++

      logger('balance-execute', { loads: loads, executing: selected })

      return funcs[selected].apply(context, args)
        .then((res) => {
          loads[selected]--
          return res
        })
        .catch((err) => {
          loads[selected]--
          throw err
        })
    }
  }
}

module.exports = getBalanceDecorator
