/* eslint-env node, mocha */
var assert = require('chai').assert
var memoizeDecorator = require('../../callback/memoize')
var logDecorator = require('../../callback/log')
var parallel = require('../../callback/parallel')
var compose = require('../../utils/compose')

describe('correct name (callback)', function () {
  it('must rename function', function () {
    var memoize = memoizeDecorator()
    var log = logDecorator()
    function test (a, next) {
      next(undefined, a)
    }

    var f1 = memoize(test)
    assert.equal(f1.name, 'memoize(test)')
    var f2 = log(f1)
    assert.equal(f2.name, 'log(memoize(test))')
  })

  it('must rename decorator with compose', function () {
    var memoize = memoizeDecorator()
    var log = logDecorator()
    var deco = compose(memoize, log)
    function test (a, next) {
      next(undefined, a)
    }

    var f1 = deco(test)
    assert.equal(f1.name, 'memoize(log(test))')
  })

  it('must rename anonymous function', function () {
    var memoize = memoizeDecorator()
    var f1 = memoize(function (a, next) {
      next(undefined, a)
    })
    assert.equal(f1.name, 'memoize(anonymous)')
  })

  it('must rename function (multiple)', function () {
    function test1 (a, next) { next(undefined, a) }
    function test2 (a, next) { next(undefined, a) }
    var f = parallel([test1, test2, function (a, next) { next(undefined, a) }])
    assert.equal(f.name, 'parallel(test1,test2,anonymous)')
  })
})
