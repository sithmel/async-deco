/* eslint-env node, mocha */
import { assert } from 'chai'
import retryDecorator from '../src/retry'

describe('retry', () => {
  let retryTenTimes
  let retryForever

  beforeEach(() => {
    retryTenTimes = retryDecorator({ times: 10 })
    retryForever = retryDecorator()
  })

  it('must pass simple function', (done) => {
    let c = 0
    const func = retryTenTimes(() => {
      return new Promise((resolve, reject) => {
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

  it('must throw always', (done) => {
    let c = 0
    const func = retryTenTimes(() => {
      return new Promise((resolve, reject) => {
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

  it('must throw and then success', (done) => {
    let c = 0
    const func = retryTenTimes(() => {
      return new Promise((resolve, reject) => {
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

  it('must retry forever', (done) => {
    let c = 0
    const func = retryForever(() => {
      c++
      return new Promise((resolve, reject) => {
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

  it('changes the name of the function', () => {
    const func = retryForever(function myfunc () {})
    assert.equal(func.name, 'retry(myfunc)')
  })
})
