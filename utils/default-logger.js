module.exports = function () {
  if (typeof this === 'object' && '__log' in this) {
    return this.__log;
  }
  return function () {};
};
