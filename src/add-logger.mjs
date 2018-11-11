import funcRenamer from './utils/func-renamer'

const generateId = () => Math.random().toString(36).slice(2)
const logFunctions = new WeakMap()

export default function addLogger (log) {
  if (!log) throw new Error('addLogger: You must have a log function as argument')
  return function (func) {
    if (typeof func !== 'function') throw new Error('addLogger: should decorate a function')
    const renamer = funcRenamer(func.name || 'anonymous')

    return renamer(function (...args) {
      const context = this
      // newContext is a short lived shell object
      // that points to the original one
      // It should be easily garbage collected at the end
      // and, with it, the logFunction
      const newContext = Object.create(context || null)
      const executionId = generateId()
      logFunctions.set(newContext, (evt, payload) => log(evt, payload, Date.now(), executionId, args))
      return func.apply(newContext, args)
    })
  }
}

export function getLogger (context) {
  return logFunctions.get(context) || (() => {})
}
