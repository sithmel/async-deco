var promisify = require('es6-promisify');
var callbackify = require('../utils/callbackify');

// it works for decorator(f) and decorator([f1, f2, f3 ...])

function promiseTranslator(decorator) {
  return function (f) { // f returns a promise
    var cb;
    if (Array.isArray(f)) {
      cb = f.map(callbackify);
    } else {
      cb = callbackify(f);
    }

    return promisify(decorator(cb));
  };
}

module.exports = promiseTranslator;
