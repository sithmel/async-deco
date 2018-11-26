/* eslint-env node, mocha */
import { assert } from 'chai'
import { CacheRAM } from 'memoize-cache'
import cacheDecorator from '../src/cache'

describe('cache', () => {
  let cached

  beforeEach(() => {
    const cache = new CacheRAM({ getKey: (a) => a })
    cached = cacheDecorator({ cache })
  })

  it('must not cache', (done) => {
    const f = cached((a, b, c) => new Promise((resolve, reject) => resolve(a + b + c)))

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(2, 5, 6).then((dep) => {
        assert.equal(dep, 13)
        done()
      })
    })
  })

  it('must cache using different keys', (done) => {
    const f = cached((a, b, c) => new Promise((resolve, reject) => resolve(a + b + c)))

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(1, 2, 10).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('does not cache when option is used', (done) => {
    const cache2 = new CacheRAM({ getKey: (a, b, c) => a + b + c })
    const cached2 = cacheDecorator({ cache2, doCacheIf: (res) => res !== 6 })
    const f = cached2((a, b, c) => new Promise((resolve, reject) => resolve(a + b + c)))

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(1, 2, 10).then((dep) => {
        assert.equal(dep, 13)
        done()
      })
    })
  })

  it('changes the name of the function', () => {
    const func = cached(function func () {})
    assert.equal(func.name, 'cache(func)')
  })
})
