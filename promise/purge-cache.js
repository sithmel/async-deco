var _purgeCache = require('../src/purge-cache');
var wrapper = require('../src/promise-translator');

function purgeCache(cache, opts) {
  return _purgeCache(wrapper, cache, opts);
}

module.exports = purgeCache;
