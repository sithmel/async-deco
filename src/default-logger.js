module.exports = function () {
  if ('__log' in this) {
    return this.__log;
  }
  return function () {};
};
