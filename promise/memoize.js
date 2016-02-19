var _memoize = require('../src/memoize');
var wrapper = require('../src/promise-translator');

function memoize(getKey, logger) {
  return _memoize(wrapper, getKey, logger);
}

module.exports = memoize;
