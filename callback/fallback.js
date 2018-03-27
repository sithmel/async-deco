var _fallback = require('../src/fallback')
var wrapper = require('../src/callback-translator')

function fallback (fallbackFunction, error) {
  return _fallback(wrapper, fallbackFunction, error)
}

module.exports = fallback
