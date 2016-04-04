var _timeout = require('../src/timeout');
var wrapper = require('../src/promise-translator');

function timeout(ms) {
  return _timeout(wrapper, ms);
}

module.exports = timeout;
