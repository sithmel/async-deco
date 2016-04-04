var _timeout = require('../src/timeout');
var wrapper = require('../src/noop');

function timeout(ms) {
  return _timeout(wrapper, ms);
}

module.exports = timeout;
