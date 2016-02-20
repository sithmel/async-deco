var _cache = require('../src/cache');
var wrapper = require('../src/noop');

function cache(cache, logger) {
  return _cache(wrapper, cache, logger);
}

module.exports = cache;
