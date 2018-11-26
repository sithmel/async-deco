/* eslint-env node, mocha */
import { assert } from 'chai'
import { CacheRAM } from 'memoize-cache'
import fallbackCacheDecorator from '../src/fallback-cache'

describe('fallback-cache', () => {
  let cached

  beforeEach(() => {
    const cache = new CacheRAM()
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

  it('must not save cache when specified', (done) => {
    const cache2 = new CacheRAM()
    const cached2 = fallbackCacheDecorator({ cache2, doCacheIf: (res) => res !== 6 })
    let counter = 0
    const f = cached2((a, b, c) => {
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
      f(1, 2, 3).catch((err) => {
        assert.equal(err.message, 'error')
        assert.instanceOf(err, Error)
        done()
      })
    })
  })

  it('can\'t fallback using a cached value', (done) => {
    const f = cached((a, b, c) => {
      return new Promise((resolve, reject) => {
        reject(new Error('error'))
      })
    })

    f(1, 2, 3).catch((err) => {
      assert.equal(err.message, 'error')
      assert.instanceOf(err, Error)
      done()
    })
  })

  it('changes the name of the function', () => {
    const func = cached(function myfunc () {})
    assert.equal(func.name, 'fallbackCache(myfunc)')
  })
})
