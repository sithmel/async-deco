var promisify = require('es6-promisify');
var callbackify = require('../utils/callbackify');

function promiseTranslator(decorator) {
  return function (f) { // f returns a promise
    return promisify(decorator(callbackify(f)));
  };
}

module.exports = promiseTranslator;
