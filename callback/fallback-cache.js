var _fallbackCache = require('../src/fallback-cache')
var wrapper = require('../src/noop')

function fallbackCache (cache, opts) {
  return _fallbackCache(wrapper, cache, opts)
}

module.exports = fallbackCache
