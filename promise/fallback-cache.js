var _fallbackCache = require('../src/fallback-cache');
var wrapper = require('../src/promise-translator');

function fallbackCache(cache, error) {
  return _fallbackCache(wrapper, cache, error);
}

module.exports = fallbackCache;
