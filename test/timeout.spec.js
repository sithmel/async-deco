/* eslint-env node, mocha */
import { assert } from 'chai'
import timeout from '../src/timeout'
import TimeoutError from '../src/errors/timeout-error'

describe('timeout', () => {
  let timeout20

  beforeEach(() => {
    timeout20 = timeout({ ms: 20 })
  })

  it('must pass simple function', (done) => {
    const func = timeout20(() => {
      return Promise.resolve('done')
    })

    func()
      .then(function (res) {
        assert.equal(res, 'done')
        done()
      })
  })

  it('must pass simple function (async)', (done) => {
    const func = timeout20(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
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

  it('must pass simple function (async) with args', (done) => {
    const func = timeout20(function (a, b) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
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

  it('must throw simple function', (done) => {
    const func = timeout20(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
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
