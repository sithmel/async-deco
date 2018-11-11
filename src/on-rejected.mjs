import funcRenamer from './utils/func-renamer'

export default function getOnRejected (fallback) {
  if (typeof fallback !== 'function') throw new Error('onRejected: it should take a function to execute when rejected')
  return function onRejected (func) {
    if (typeof func !== 'function') throw new Error('onRejected: should decorate a function')
    const renamer = funcRenamer(`${fallback.name || '_'}(${func.name || 'anonymous'})`)
    return renamer(function _onRejected (...args) {
      return func.apply(this, args)
        .catch((err) => fallback(err))
    })
  }
}
