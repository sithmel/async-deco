var debounce = require('lodash/debounce')
var throttle = require('lodash/throttle')
var decoratorCacheFactory = require('../utils/decorator-cache-factory')

function debounceCBDecorator (wait, opts) {
  return function _debounceCBDecorator (func) {
    return debounce(func, wait, opts)
  }
}

function throttleCBDecorator (wait, opts) {
  return function _throttleCBDecorator (func) {
    return throttle(func, wait, opts)
  }
}

function getDebounceDecorator (wrapper, wait, debounceOpts, getKey, cacheOpts) {
  return decoratorCacheFactory(wrapper, debounceCBDecorator(wait, debounceOpts), getKey, cacheOpts)
}

function getThrottleDecorator (wrapper, wait, throttleOpts, getKey, cacheOpts) {
  return decoratorCacheFactory(wrapper, throttleCBDecorator(wait, throttleOpts), getKey, cacheOpts)
}

module.exports = {
  debounce: getDebounceDecorator,
  throttle: getThrottleDecorator
}
