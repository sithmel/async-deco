var promisify = require('../utils/promisify')
var callbackify = require('../utils/callbackify')
var funcRenamer = require('../utils/func-renamer')

// it works for decorator(f) and decorator([f1, f2, f3 ...])

function getFuncName (func) {
  return func.name || 'anonymous'
}

function promiseTranslator (decorator) {
  var decoratorName = decorator.name
  return function _getPromise (f) { // f returns a promise
    var funcName
    var cb
    if (Array.isArray(f)) {
      cb = f.map(callbackify)
      funcName = f.map(getFuncName).join(',')
    } else {
      cb = callbackify(f)
      funcName = getFuncName(f)
    }
    var funcRename = funcRenamer(decoratorName + '(' + funcName + ')')
    return funcRename(promisify(decorator(cb)))
  }
}

module.exports = promiseTranslator
