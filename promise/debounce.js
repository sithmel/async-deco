var _debounce = require('../src/debounce').debounce;
var wrapper = require('../src/promise-translator');

function debounce(wait, debounceOpts, getKey, cacheOpts) {
  return _debounce(wrapper, wait, debounceOpts, getKey, cacheOpts);
}

module.exports = debounce;
