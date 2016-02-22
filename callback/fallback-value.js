var _fallbackValue = require('../src/fallback-value');
var wrapper = require('../src/noop');

function fallbackValue(value, error, logger) {
  return _fallbackValue(wrapper, value, error, logger);
}

module.exports = fallbackValue;
