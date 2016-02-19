var _retry = require('../src/retry');
var wrapper = require('../src/promise-translator');

function retry(times, interval, error, logger) {
  return _retry(wrapper, times, interval, error, logger);
}

module.exports = retry;
