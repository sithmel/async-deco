/* eslint-env node, mocha */
var assert = require('chai').assert
var memoizeDecorator = require('../../callback/memoize')

describe('memoize (callback)', function () {
  var simpleMemoize, complexMemoize

  beforeEach(function () {
    simpleMemoize = memoizeDecorator()
    complexMemoize = memoizeDecorator(function (a, b, c) {
      return a + b + c
    })
  })

  it('must memoize with any parameter', function (done) {
    var f = simpleMemoize(function (a, b, c, next) {
      next(undefined, a + b + c)
    })

    f(1, 2, 3, function (err, dep) {
      assert.isFalse(!!err)
      assert.equal(dep, 6)
      f(8, function (err, dep) {
        assert.isFalse(!!err)
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('must memoize using different keys', function (done) {
    var f = complexMemoize(function (a, b, c, next) {
      next(undefined, a + b + c)
    })

    f(1, 2, 3, function (err, dep) {
      assert.isFalse(!!err)
      assert.equal(dep, 6)
      f(3, 2, 1, function (err, dep) {
        assert.isFalse(!!err)
        assert.equal(dep, 6)
        done()
      })
    })
  })
})

describe('memoize with parameters (callback)', function () {
  var cached

  beforeEach(function () {
    cached = memoizeDecorator({
      len: 1,
      cacheKey: function (a, b, c) {
        return a + b + c
      }
    })
  })

  it('must cache using different keys', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, a + b + c)
    })

    f(1, 2, 3, function (err, dep) {
      assert.isFalse(!!err)
      assert.equal(dep, 6)
      f(3, 2, 1, function (err, dep) {
        assert.isFalse(!!err)
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('must cache', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random())
    })

    f(1, 2, 3, function (err, res1) {
      assert.isFalse(!!err)
      f(3, 2, 1, function (err, res2) {
        assert.isFalse(!!err)
        assert.equal(res1, res2)
        done()
      })
    })
  })
})
