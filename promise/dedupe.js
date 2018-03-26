var _dedupe = require('../src/dedupe')
var wrapper = require('../src/promise-translator')

function dedupe (opts) {
  return _dedupe(wrapper, opts)
}

module.exports = dedupe
