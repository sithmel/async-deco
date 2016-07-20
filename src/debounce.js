var defaultLogger = require('../utils/default-logger');
var keyGetter = require('memoize-cache-utils/key-getter');
var LRU = require('little-ds-toolkit/lib/lru-cache');
var debounce = require('lodash/debounce');
var throttle = require('lodash/throttle');

function debounceCBDecorator(wait, opts) {
  return function (func) {
    return debounce(func, wait, opts);
  };
}

function throttleCBDecorator(wait, opts) {
  return function (func) {
    return throttle(func, wait, opts);
  };
}

function decoratorCacheFactory(wrapper, decorator, getKey, cacheOpts) {
  getKey = keyGetter(getKey || function () { return '_default'; });
  var lru = new LRU(cacheOpts);
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cacheKey = getKey.apply(context, args);

      if (cacheKey === null) {
        return func.apply(context, args);
      }
      var f = lru.get(cacheKey);
      if (!f || typeof f !== 'function') {
        f = decorator(func);
        lru.set(cacheKey, f);
      }
      f.apply(context, args);
    };
  });
}

function debounceDecorator(wrapper, wait, debounceOpts, getKey, cacheOpts) {
  return decoratorCacheFactory(wrapper, debounceCBDecorator(wait, debounceOpts), getKey, cacheOpts);
}

function throttleDecorator(wrapper, wait, throttleOpts, getKey, cacheOpts) {
  return decoratorCacheFactory(wrapper, throttleCBDecorator(wait, throttleOpts), getKey, cacheOpts);
}

module.exports = {
  debounce: debounceDecorator,
  throttle: throttleDecorator
};
