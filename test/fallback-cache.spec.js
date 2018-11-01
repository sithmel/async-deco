/* eslint-env node, mocha */
var assert = require('chai').assert
var Cache = require('memoize-cache').CacheRAM
var fallbackCacheDecorator = require('../src/fallback-cache')

describe('fallback-cache (promise)', function () {
  var cached

  beforeEach(function () {
    var cache = new Cache()
    cached = fallbackCacheDecorator(cache)
  })

  it('must fallback using a cached value', function (done) {
    var counter = 0
    var f = cached(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        counter++
        if (counter === 1) {
          resolve(a + b + c)
        } else {
          reject(new Error('error'))
        }
      })
    })

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6)
      f(1, 2, 3).then(function (dep) {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('can\'t fallback using a cached value', function (done) {
    var f = cached(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        reject(new Error('error'))
      })
    })

    f(1, 2, 3).catch(function (err) {
      assert.equal(err.message, 'error')
      assert.instanceOf(err, Error)
      done()
    })
  })
})
