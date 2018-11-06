var funcRenamer = require('./utils/func-renamer')

const generateId = () => Math.random().toString(36).slice(2)
const logFunctions = new WeakMap()

function addLogger (log) {
  return function (func) {
    const renamer = funcRenamer(func.name || 'anonymous')

    return renamer(function (...args) {
      const context = this
      // newContext is a short lived shell object
      // that points to the original one
      // It should be easily garbage collected at the end
      // and, with it, the logFunction
      const newContext = Object.create(context || null)
      const executionId = generateId()
      logFunctions.set(newContext, (evt, payload) => log(evt, payload, Date.now(), executionId))
      return func.apply(newContext, args)
    })
  }
}

function getLogger (context) {
  return logFunctions.get(context) || (() => {})
}

addLogger.getLogger = getLogger

module.exports = addLogger
