module.exports = function getErrorCondition(ErrorClass) {
  var error = ErrorClass || Error;
  if (error === Error || Error.isPrototypeOf(error)) {
    return function isError(err, res) { return err instanceof error; };
  }
  return error;
};
