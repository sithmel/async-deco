var _atomic = require('../src/atomic')
var wrapper = require('../src/callback-translator')

function atomic (opts) {
  return _atomic(wrapper, opts)
}

module.exports = atomic
