var _log = require('../src/log')
var wrapper = require('../src/callback-translator')

function log (prefix) {
  return _log(wrapper, prefix)
}

module.exports = log
