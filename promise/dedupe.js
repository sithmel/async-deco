var _dedupe = require('../src/dedupe');
var wrapper = require('../src/promise-translator');

function dedupe(getKey) {
  return _dedupe(wrapper, getKey);
}

module.exports = dedupe;
