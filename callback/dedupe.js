var _dedupe = require('../src/dedupe')
var wrapper = require('../src/callback-translator')

function dedupe (opts) {
  return _dedupe(wrapper, opts)
}

module.exports = dedupe
