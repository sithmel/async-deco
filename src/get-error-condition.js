module.exports = function getErrorCondition (ErrorClassOrFunction) {
  if (typeof ErrorClassOrFunction === 'function') return ErrorClassOrFunction
  ErrorClassOrFunction = ErrorClassOrFunction || Error
  return (err) => err instanceof ErrorClassOrFunction
}
