var buildLogger = require('./build-logger');
var uuid = require('uuid');

function addLogger(log, name) {
  return function (func) {
    name = name || func.name;
    return function () {
      var id = uuid.v4();
      var context = buildLogger(this, name, id, log);
      var args = Array.prototype.slice.call(arguments, 0);
      return func.apply(context, args);
    };
  };
}

module.exports = addLogger;
