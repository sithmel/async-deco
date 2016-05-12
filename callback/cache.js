var _cache = require('../src/cache');
var wrapper = require('../src/noop');

function cache(cache, opts) {
  return _cache(wrapper, cache, opts);
}

module.exports = cache;
