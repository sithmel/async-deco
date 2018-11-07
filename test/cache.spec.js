/* eslint-env node, mocha */
import { assert } from 'chai'
import { CacheRAM } from 'memoize-cache'
import cacheDecorator from '../src/cache'

describe('cache', () => {
  let cached

  beforeEach(() => {
    const cache = new CacheRAM({ key: (a, b, c) => a + b + c })
    cached = cacheDecorator({ cache })
  })

  it('must cache using different keys', (done) => {
    const f = cached((a, b, c) => new Promise((resolve, reject) => resolve(a + b + c)))

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(3, 2, 1).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('changes the name of the function', () => {
    const func = cached(function func () {})
    assert.equal(func.name, 'cache(func)')
  })
})
