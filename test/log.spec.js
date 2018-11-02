/* eslint-env node, mocha */
var assert = require('chai').assert
var logDecorator = require('../src/log')

describe('log (promise)', function () {
  var wrapped
  var log

  beforeEach(function () {
    log = []
    var logger = function (type, obj, ts) {
      log.push({ type: type, obj: obj })
    }

    wrapped = logDecorator({ logger })
  })

  it('must log success', function (done) {
    var f = wrapped(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c)
      })
    })

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6)
      assert.deepEqual(log, [
        { type: 'log-start', obj: {} },
        { type: 'log-end', obj: { result: 6 } }
      ])
      done()
    })
  })

  it('must log error', function (done) {
    var f = wrapped(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        reject(new Error('error!'))
      })
    })
    f(1, 2, 3).catch(function (err) {
      assert.instanceOf(err, Error)
      assert.deepEqual(log[0],
        { type: 'log-start', obj: {} })
      assert.deepEqual(log[1].type, 'log-error')
      assert.instanceOf(log[1].obj.err, Error)
      done()
    })
  })
})
