/* eslint-env node, mocha */
var assert = require('chai').assert
var retryDecorator = require('../src/retry')

describe('retry (promise)', function () {
  var retryTenTimes
  var retryForever

  beforeEach(function () {
    retryTenTimes = retryDecorator({ times: 10 })
    retryForever = retryDecorator()
  })

  it('must pass simple function', function (done) {
    var c = 0
    var func = retryTenTimes(function () {
      return new Promise(function (resolve, reject) {
        c++
        resolve('done')
      })
    })

    func().then(function (res) {
      assert.equal(res, 'done')
      assert.equal(c, 1)
      done()
    })
  })

  it('must throw always', function (done) {
    var c = 0
    var func = retryTenTimes(function () {
      return new Promise(function (resolve, reject) {
        c++
        reject(new Error('error'))
      })
    })

    func().catch(function (err, res) {
      assert.isUndefined(res)
      assert.instanceOf(err, Error)
      assert.equal(c, 10)
      done()
    })
  })

  it('must throw and then success', function (done) {
    var c = 0
    var func = retryTenTimes(function () {
      return new Promise(function (resolve, reject) {
        c++
        if (c === 5) {
          return resolve('done')
        }
        reject(new Error('error'))
      })
    })

    func().then(function (res) {
      assert.equal(res, 'done')
      assert.equal(c, 5)
      done()
    })
  })

  it('must retry forever', function (done) {
    var c = 0
    var func = retryForever(function () {
      c++
      return new Promise(function (resolve, reject) {
        if (c < 100) {
          reject(new Error('error'))
        } else {
          resolve('done')
        }
      })
    })

    func().then(function (res) {
      assert.equal(res, 'done')
      assert.equal(c, 100)
      done()
    })
  })
})
