var _throttle = require('../src/throttle');
var wrapper = require('../src/noop');

function throttle(delay, timingFunc, options, getKey, logger) {
  return _throttle(wrapper, delay, timingFunc, options, getKey, logger);
}

module.exports = throttle;
