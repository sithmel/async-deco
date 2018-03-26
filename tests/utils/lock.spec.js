/* eslint-env node, mocha */
var assert = require('chai').assert
var Lock = require('../../utils/lock')

describe('lock', function () {
  it('is a factory function', function () {
    assert.typeOf(Lock, 'function')
    assert.typeOf(new Lock(), 'object')
  })

  it('execute a function', function (done) {
    var l = new Lock()
    l.lock('resource1', 10, function (err, lock) {
      assert.equal(err, null)
      done()
    })
  })

  it('locks a resource', function (done) {
    var l = new Lock()
    var c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(function () {
        c++
        assert.equal(c, 1)
        lock.unlock()
      }, 40)
    })
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      c++
      assert.equal(c, 2)
      done()
    })
  })

  it('locks a resource (2)', function (done) {
    var l = new Lock()
    var c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(function () {
        c++
        assert.equal(c, 1)
        lock.unlock()
      }, 40)
    })
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      c++
      assert.equal(c, 2)
      lock.unlock()
    })
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      c++
      assert.equal(c, 3)
      lock.unlock()
      done()
    })
  })

  it('does not lock different resources', function (done) {
    var l = new Lock()
    var c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(function () {
        c++
        assert.equal(c, 2)
        lock.unlock()
      }, 40)
    })
    l.lock('resource2', 100, function (err, lock) {
      assert.isFalse(!!err)
      c++
      assert.equal(c, 1)
      done()
    })
  })

  it('does expire', function (done) {
    var l = new Lock()
    var c = 0
    l.lock('resource1', 10, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(function () {
        c++
        assert.equal(c, 2)
        lock.unlock()
      }, 40)
    })
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      c++
      assert.equal(c, 1)
      done()
    })
  })
})
