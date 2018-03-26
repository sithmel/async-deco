/* eslint-env node, mocha */
var assert = require('chai').assert
var logDecorator = require('../../callback/log')
var addLogger = require('../../utils/add-logger')

function getLogkey () {
  return 'key'
}

describe('log (callback)', function () {
  var wrapped
  var addLog
  var log

  beforeEach(function () {
    log = []
    var logger = function (type, obj, ts, key) {
      log.push({type: type, obj: obj, key: key})
    }

    wrapped = logDecorator()
    addLog = addLogger(logger, getLogkey)
  })

  it('must log success (use prefix)', function (done) {
    wrapped = logDecorator('prefix-')
    var f = addLog(wrapped(function (a, b, c, next) {
      next(undefined, a + b + c)
    }))
    f(1, 2, 3, function (err, dep) {
      assert.isFalse(!!err)
      assert.equal(dep, 6)
      assert.deepEqual(log, [
        {type: 'prefix-log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}, key: 'key'},
        {type: 'prefix-log-end', obj: {result: 6}, key: 'key'}
      ])
      done()
    })
  })

  it('must log success', function (done) {
    var f = addLog(wrapped(function (a, b, c, next) {
      next(undefined, a + b + c)
    }))
    f(1, 2, 3, function (err, dep) {
      assert.isFalse(!!err)
      assert.equal(dep, 6)
      assert.deepEqual(log, [
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}, key: 'key'},
        {type: 'log-end', obj: {result: 6}, key: 'key'}
      ])
      done()
    })
  })

  it('must log error', function (done) {
    var f = addLog(wrapped(function (a, b, c, next) {
      next(new Error('error!'))
    }))
    f(1, 2, 3, function (err, dep) {
      assert.instanceOf(err, Error)
      assert.deepEqual(log[0],
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}, key: 'key'})
      assert.deepEqual(log[1].type, 'log-error')
      assert.deepEqual(log[1].key, 'key')
      assert.instanceOf(log[1].obj.err, Error)
      done()
    })
  })
})
