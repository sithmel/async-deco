var funcRenamer = require('./utils/func-renamer')

function getFuncName (func) {
  return func.name || 'anonymous'
}

function callBackTranslator (decorator) {
  var decoratorName = decorator.name
  return function _callback (f) {
    var funcName
    if (Array.isArray(f)) {
      funcName = f.map(getFuncName).join(',')
    } else {
      funcName = getFuncName(f)
    }
    var funcRename = funcRenamer(decoratorName + '(' + funcName + ')')
    return funcRename(decorator(f))
  }
}

module.exports = callBackTranslator
