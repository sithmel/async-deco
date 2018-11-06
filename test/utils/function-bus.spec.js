/* eslint-env node, mocha */
import { assert } from 'chai'
import FunctionBus from '../../src/utils/function-bus'

describe('function bus', () => {
  it('is a factory function', () => {
    assert.typeOf(FunctionBus, 'function')
    assert.typeOf(new FunctionBus(), 'object')
  })

  it('pub sub', (done) => {
    const bus = new FunctionBus()
    let result = ''
    bus.queue('a', function (obj) {
      result += obj
    })
    bus.queue('a', function (obj) {
      result += obj
    })
    bus.queue('b', function (obj) {
      result += obj
    })
    bus.execute('a', null, 'test')
    setTimeout(function () {
      assert.equal(result, 'testtest')
      done()
    }, 10)
  })
})
