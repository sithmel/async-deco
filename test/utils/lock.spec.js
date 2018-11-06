/* eslint-env node, mocha */
import { assert } from 'chai'
import Lock from '../../src/utils/lock'

describe('lock', () => {
  it('is a factory function', () => {
    assert.typeOf(Lock, 'function')
    assert.typeOf(new Lock(), 'object')
  })

  it('execute a function', (done) => {
    const l = new Lock()
    l.lock('resource1', 10, function (err, lock) {
      assert.equal(err, null)
      done()
    })
  })

  it('locks a resource', (done) => {
    const l = new Lock()
    let c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(() => {
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

  it('locks a resource (2)', (done) => {
    const l = new Lock()
    let c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(() => {
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

  it('does not lock different resources', (done) => {
    const l = new Lock()
    let c = 0
    l.lock('resource1', 100, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(() => {
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

  it('does expire', (done) => {
    const l = new Lock()
    let c = 0
    l.lock('resource1', 10, function (err, lock) {
      assert.isFalse(!!err)
      setTimeout(() => {
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
