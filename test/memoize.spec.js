/* eslint-env node, mocha */
import { assert } from 'chai'
import memoizeDecorator from '../src/memoize'

describe('memoize', () => {
  let simpleMemoize, complexMemoize

  beforeEach(() => {
    simpleMemoize = memoizeDecorator()
    complexMemoize = memoizeDecorator((a, b, c) => a + b + c)
  })

  it('must memoize with any parameter', (done) => {
    const f = simpleMemoize((a, b, c) => {
      return new Promise((resolve, reject) => {
        resolve(a + b + c)
      })
    })

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(8).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('must memoize using different keys', (done) => {
    const f = complexMemoize((a, b, c) => {
      return new Promise((resolve, reject) => {
        resolve(a + b + c)
      })
    })

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(3, 2, 1).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })
})

describe('memoize with parameters (promise)', () => {
  let cached

  beforeEach(() => {
    cached = memoizeDecorator({
      len: 1,
      cacheKey: (a, b, c) => a + b + c
    })
  })

  it('must cache using different keys', (done) => {
    const f = cached((a, b, c) => {
      return Promise.resolve(a + b + c)
    })

    f(1, 2, 3).then((dep) => {
      assert.equal(dep, 6)
      f(3, 2, 1).then((dep) => {
        assert.equal(dep, 6)
        done()
      })
    })
  })

  it('must cache', (done) => {
    const f = cached((a, b, c) => {
      return Promise.resolve(Math.random())
    })

    f(1, 2, 3).then((res1) => {
      f(3, 2, 1).then((res2) => {
        assert.equal(res1, res2)
        done()
      })
    })
  })
})
