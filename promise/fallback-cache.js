var _fallbackCache = require('../src/fallback-cache');
var wrapper = require('../src/promise-translator');

function fallbackCache(cache, error, logger) {
  return _fallbackCache(wrapper, cache, error, logger);
}

module.exports = fallbackCache;
