var _memoize = require('../src/memoize');
var wrapper = require('../src/noop');

function memoize(getKey, logger) {
  return _memoize(wrapper, getKey, logger);
}

module.exports = memoize;
