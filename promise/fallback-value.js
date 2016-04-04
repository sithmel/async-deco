var _fallbackValue = require('../src/fallback-value');
var wrapper = require('../src/promise-translator');

function fallbackValue(value, error) {
  return _fallbackValue(wrapper, value, error);
}

module.exports = fallbackValue;
