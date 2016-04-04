var _fallbackCache = require('../src/fallback-cache');
var wrapper = require('../src/noop');

function fallbackCache(cache, error) {
  return _fallbackCache(wrapper, cache, error);
}

module.exports = fallbackCache;
