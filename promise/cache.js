var _cache = require('../src/cache');
var wrapper = require('../src/promise-translator');

function cache(cache) {
  return _cache(wrapper, cache);
}

module.exports = cache;
