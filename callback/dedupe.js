var _dedupe = require('../src/dedupe');
var wrapper = require('../src/noop');

function dedupe(delay, getKey, logger) {
  return _dedupe(wrapper, delay, getKey, logger);
}

module.exports = dedupe;
