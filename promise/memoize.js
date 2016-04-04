var _memoize = require('../src/memoize');
var wrapper = require('../src/promise-translator');

function memoize(getKey) {
  return _memoize(wrapper, getKey);
}

module.exports = memoize;
