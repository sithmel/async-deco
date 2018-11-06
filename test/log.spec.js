/* eslint-env node, mocha */
var assert = require('chai').assert
var addLogger = require('../src/add-logger')
var logDecorator = require('../src/log')

describe('log (promise)', function () {
  var logs
  var log
  var addLoggerDecorator

  beforeEach(function () {
    logs = []
    addLoggerDecorator = addLogger((type, obj, ts, executionId) => logs.push({ type: type, obj: obj }))
    log = logDecorator()
  })

  it('must log success', function (done) {
    var f = addLoggerDecorator(log(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c)
      })
    }))

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6)
      assert.deepEqual(logs, [
        { type: 'log-start', obj: {} },
        { type: 'log-end', obj: { result: 6 } }
      ])
      done()
    })
  })

  it('must log error', function (done) {
    var f = addLoggerDecorator(log(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        reject(new Error('error!'))
      })
    }))
    f(1, 2, 3).catch(function (err) {
      assert.instanceOf(err, Error)
      assert.deepEqual(logs[0],
        { type: 'log-start', obj: {} })
      assert.deepEqual(logs[1].type, 'log-error')
      assert.instanceOf(logs[1].obj.err, Error)
      done()
    })
  })
})
