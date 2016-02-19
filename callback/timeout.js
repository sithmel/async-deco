var _timeout = require('../src/timeout');
var wrapper = require('../src/noop');

function timeout(ms, logger) {
  return _timeout(wrapper, ms, logger);
}

module.exports = timeout;
