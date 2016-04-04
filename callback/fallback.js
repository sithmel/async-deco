var _fallback = require('../src/fallback');
var wrapper = require('../src/noop');

function fallback(fallbackFunction, error) {
  return _fallback(wrapper, fallbackFunction, error);
}

module.exports = fallback;
