/* eslint-env node, mocha */
import { assert } from 'chai'
import addLogger from '../src/add-logger'
import logDecorator from '../src/log'

describe('log', () => {
  let logs
  let log
  let addLoggerDecorator

  beforeEach(() => {
    logs = []
    addLoggerDecorator = addLogger((type, obj, ts, executionId) => logs.push({ type: type, obj: obj }))
    log = logDecorator()
  })

  it('must log success', (done) => {
    const f = addLoggerDecorator(log((a, b, c) => {
      return new Promise((resolve, reject) => {
        resolve(a + b + c)
      })
    }))

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      assert.deepEqual(logs, [
        { type: 'log-start', obj: {} },
        { type: 'log-end', obj: { res: 6 } }
      ])
      done()
    })
  })

  it('must log error', (done) => {
    const f = addLoggerDecorator(log((a, b, c) => {
      return new Promise((resolve, reject) => {
        reject(new Error('error!'))
      })
    }))
    f(1, 2, 3).catch((err) => {
      assert.instanceOf(err, Error)
      assert.deepEqual(logs[0],
        { type: 'log-start', obj: {} })
      assert.deepEqual(logs[1].type, 'log-error')
      assert.instanceOf(logs[1].obj.err, Error)
      done()
    })
  })

  it('changes the name of the function', () => {
    const func = log(function myfunc () {})
    assert.equal(func.name, 'log(myfunc)')
  })
})
