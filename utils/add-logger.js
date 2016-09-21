var buildLogger = require('./build-logger');

function addLogger(log) {
  return function (func) {
    return function () {
      var context = buildLogger(this, log);
      var args = Array.prototype.slice.call(arguments, 0);
      return func.apply(context, args);
    };
  };
}

module.exports = addLogger;
