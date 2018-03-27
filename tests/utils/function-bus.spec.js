/* eslint-env node, mocha */
var assert = require('chai').assert
var FunctionBus = require('../../utils/function-bus')

describe('function bus', function () {
  it('is a factory function', function () {
    assert.typeOf(FunctionBus, 'function')
    assert.typeOf(new FunctionBus(), 'object')
  })

  it('pub sub', function (done) {
    var bus = new FunctionBus()
    var result = ''
    bus.queue('a', function (obj) {
      result += obj
    })
    bus.queue('a', function (obj) {
      result += obj
    })
    bus.queue('b', function (obj) {
      result += obj
    })
    bus.execute('a', ['test'])
    setTimeout(function () {
      assert.equal(result, 'testtest')
      done()
    }, 10)
  })
})