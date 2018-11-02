var getLogger = require('./utils/get-logger')
var balancePolicies = require('./utils/balance-policies')
var funcRenamer = require('./utils/func-renamer')

function getBalanceDecorator (opts = {}) {
  const policy = opts.policy || balancePolicies.idlest
  const logger = getLogger(opts.logger)
  return function balance (funcs) {
    const loads = funcs.map(function () { return 0 })
    const renamer = funcRenamer(`balance(${funcs.map((func) => func.name || 'anonymous').join(',')})`)
    let executionNumber = 0

    return renamer(function _balance (...args) {
      const context = this

      // var cb = args[args.length - 1]
      const selected = policy.call(context, executionNumber++, loads, args)
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
    })
  }
}

module.exports = getBalanceDecorator
