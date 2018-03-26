/* eslint-env node, mocha */
var assert = require('chai').assert
var atomicDecorator = require('../../promise/atomic')
var redis = require('redis')
var Redlock = require('redlock')

describe('atomic (promise)', function () {
  var limitToOne

  beforeEach(function () {
    limitToOne = atomicDecorator()
  })

  it('must limit to one function call', function (done) {
    var numberRunning = 0
    var f0 = function (a) {
      numberRunning++
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          numberRunning--
          resolve(a)
        }, a)
      })
    }

    var f = limitToOne(f0)

    var c = 0
    var getResult = function (dep) {
      assert.equal(numberRunning, 0)
      c++
      if (c === 3) {
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })
})

describe('atomic using redis (promise)', function () {
  var limitToOne, client

  beforeEach(function () {
    client = redis.createClient()

    var redlock = new Redlock([client])
    limitToOne = atomicDecorator({ lock: redlock })
  })

  afterEach(function () {
    client.quit()
  })

  it('must limit to one function call', function (done) {
    var numberRunning = 0
    var f0 = function (a) {
      numberRunning++
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          numberRunning--
          resolve(a)
        }, a)
      })
    }

    var f = limitToOne(f0)

    var c = 0
    var getResult = function (dep) {
      assert.equal(numberRunning, 0)
      c++
      if (c === 3) {
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })
})
