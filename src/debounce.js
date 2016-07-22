var debounce = require('lodash/debounce');
var throttle = require('lodash/throttle');
var decoratorCacheFactory = require('../utils/decorator-cache-factory');

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
