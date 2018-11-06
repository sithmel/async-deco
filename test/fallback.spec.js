/* eslint-env node, mocha */
import { assert } from 'chai'
import fallbackDecorator from '../src/fallback'

describe('fallback', () => {
  let fallback

  beforeEach(() => {
    fallback = fallbackDecorator({ fallback: (a, b, c) => Promise.resolve('giving up') })
  })

  it('must pass', (done) => {
    const f = fallback((a, b, c) => {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c)
      })
    })
    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      done()
    })
  })

  it('must fallback', (done) => {
    const f = fallback((a, b, c) => {
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
