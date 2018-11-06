import { getLogger } from './add-logger'
import { idlest } from './utils/balance-policies'
import funcRenamer from './utils/func-renamer'

export default function getBalanceDecorator (opts = {}) {
  const policy = opts.policy || idlest
  return function balance (funcs) {
    const loads = funcs.map(function () { return 0 })
    const renamer = funcRenamer(`balance(${funcs.map((func) => func.name || 'anonymous').join(',')})`)
    let executionNumber = 0

    return renamer(function _balance (...args) {
      const context = this
      const logger = getLogger(context)

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
