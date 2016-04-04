var _retry = require('../src/retry');
var wrapper = require('../src/promise-translator');

function retry(times, interval, error) {
  return _retry(wrapper, times, interval, error);
}

module.exports = retry;
