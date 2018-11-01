/* eslint-env node, mocha */
var assert = require('chai').assert
var timeout = require('../src/timeout')
var TimeoutError = require('../src/errors/timeout-error')

describe('timeout (promise)', function () {
  var timeout20

  beforeEach(function () {
    timeout20 = timeout(20)
  })

  it('must pass simple function', function (done) {
    var func = timeout20(function () {
      return Promise.resolve('done')
    })

    func()
      .then(function (res) {
        assert.equal(res, 'done')
        done()
      })
  })

  it('must pass simple function (async)', function (done) {
    var func = timeout20(function () {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve('done')
        }, 10)
      })
    })

    func()
      .then(function (res) {
        assert.equal(res, 'done')
        done()
      })
  })

  it('must pass simple function (async) with args', function (done) {
    var func = timeout20(function (a, b) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a + b)
        }, 10)
      })
    })

    func(5, 6)
      .then(function (res) {
        assert.equal(res, 11)
        done()
      })
  })

  it('must throw simple function', function (done) {
    var func = timeout20(function () {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(done)
        }, 25)
      })
    })

    func()
      .catch(function (err) {
        assert.instanceOf(err, TimeoutError)
        done()
      })
  })
})
