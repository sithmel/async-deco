var buildLogger = require('./build-logger');
var keyGetter = require('memoize-cache-utils/key-getter');

function addLogger(log, getKey) {
  getKey = keyGetter(getKey || function () { return Math.floor(Math.random() * 10000000).toString(); });
  return function (func) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      var logKey = getKey.apply(this, args);
      var context = buildLogger(this, log, logKey);
      return func.apply(context, args);
    };
  };
}

module.exports = addLogger;
