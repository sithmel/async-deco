var _dedupe = require('../src/dedupe');
var wrapper = require('../src/promise-translator');

function dedupe(getKey, logger) {
  return _dedupe(wrapper, getKey, logger);
}

module.exports = dedupe;
