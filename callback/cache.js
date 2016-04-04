var _cache = require('../src/cache');
var wrapper = require('../src/noop');

function cache(cache) {
  return _cache(wrapper, cache);
}

module.exports = cache;
