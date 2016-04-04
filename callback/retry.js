var _retry = require('../src/retry');
var wrapper = require('../src/noop');

function retry(times, interval, error) {
  return _retry(wrapper, times, interval, error);
}

module.exports = retry;
