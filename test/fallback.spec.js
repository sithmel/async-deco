/* eslint-env node, mocha */
var assert = require('chai').assert
var fallbackDecorator = require('../src/fallback')

describe('fallback (promise)', function () {
  var fallback

  beforeEach(function () {
    fallback = fallbackDecorator(function (a, b, c) {
      return Promise.resolve('giving up')
    })
  })

  it('must pass', function (done) {
    var f = fallback(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c)
      })
    })
    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6)
      done()
    })
  })

  it('must fallback', function (done) {
    var f = fallback(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        reject(new Error('error!'))
      })
    })
    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 'giving up')
      done()
    })
  })
})
