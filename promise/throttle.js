var _throttle = require('../src/debounce').throttle;
var wrapper = require('../src/promise-translator');

function throttle(wait, throttleOpts, getKey, cacheOpts) {
  return _throttle(wrapper, wait, throttleOpts, getKey, cacheOpts);
}

module.exports = throttle;
