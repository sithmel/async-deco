var _timeout = require('../src/timeout')
var wrapper = require('../src/callback-translator')

function timeout (ms) {
  return _timeout(wrapper, ms)
}

module.exports = timeout
