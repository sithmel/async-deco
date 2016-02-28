var _dedupe = require('../src/dedupe');
var wrapper = require('../src/noop');

function dedupe(getKey, logger) {
  return _dedupe(wrapper, getKey, logger);
}

module.exports = dedupe;
