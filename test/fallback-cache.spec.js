/* eslint-env node, mocha */
import { assert } from 'chai'
import { CacheRAM } from 'memoize-cache'
import fallbackCacheDecorator from '../src/fallback-cache'

describe('fallback-cache', () => {
  let cached

  beforeEach(() => {
    var cache = new CacheRAM()
    cached = fallbackCacheDecorator({ cache })
  })

  it('must fallback using a cached value', (done) => {
    let counter = 0
    const f = cached((a, b, c) => {
      return new Promise((resolve, reject) => {
        counter++
        if (counter === 1) {
          resolve(a + b + c)
        } else {
          reject(new Error('error'))
        }
      })
    })

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(1, 2, 3).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('can\'t fallback using a cached value', (done) => {
    const f = cached((a, b, c) => {
      return new Promise(function (resolve, reject) {
        reject(new Error('error'))
      })
    })

    f(1, 2, 3).catch((err) => {
      assert.equal(err.message, 'error')
      assert.instanceOf(err, Error)
      done()
    })
  })
})
