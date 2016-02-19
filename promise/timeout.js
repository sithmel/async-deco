var _timeout = require('../src/timeout');
var wrapper = require('../src/promise-translator');

function timeout(ms, logger) {
  return _timeout(wrapper, ms, logger);
}

module.exports = timeout;
