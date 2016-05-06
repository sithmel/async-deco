var _fallbackCache = require('../src/fallback-cache');
var wrapper = require('../src/promise-translator');

function fallbackCache(cache, opts) {
  return _fallbackCache(wrapper, cache, opts);
}

module.exports = fallbackCache;
