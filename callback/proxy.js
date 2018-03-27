var _proxy = require('../src/proxy')
var wrapper = require('../src/callback-translator')

function proxy (guard) {
  return _proxy(wrapper, guard)
}

module.exports = proxy
