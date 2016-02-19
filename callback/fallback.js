var _fallback = require('../src/fallback');
var wrapper = require('../src/noop');

function fallback(fallbackFunction, error, logger) {
  return _fallback(wrapper, fallbackFunction, error, logger);
}

module.exports = fallback;
