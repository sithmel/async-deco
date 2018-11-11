import funcRenamer from './utils/func-renamer'

export default function getOnFulfilled (fallback) {
  if (typeof fallback !== 'function') throw new Error('onFilfilled: it should take a function to execute when fulfilled')
  return function onFulfilled (func) {
    if (typeof func !== 'function') throw new Error('onFulfilled: should decorate a function')
    const renamer = funcRenamer(`${fallback.name || '_'}(${func.name || 'anonymous'})`)
    return renamer(function _onFulfilled (...args) {
      return func.apply(this, args)
        .then((res) => fallback(res))
    })
  }
}
