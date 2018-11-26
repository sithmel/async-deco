/* eslint-env node, mocha */
import { assert } from 'chai'
import memoize from '../src/memoize'

function delay (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

describe('cacheDependency', () => {
  let cacheOnce
  let cacheTwice
  let cacheTTL

  beforeEach(() => {
    cacheOnce = memoize({ len: 1 })
    cacheTwice = memoize({ len: 2 })
    cacheTTL = memoize({ len: 1, ttl: 1 })
  })

  it('caches once', async () => {
    let executions = 0
    const cachedFunc = cacheOnce((a, b) => {
      executions++
      return Promise.resolve(a + b)
    })
    const res1 = await cachedFunc(1, 2)
    const res2 = await cachedFunc(1, 2)
    const res3 = await cachedFunc(2, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 4)
    assert.equal(executions, 2)
  })

  it('caches sync functions', async () => {
    let executions = 0
    const cachedFunc = cacheOnce((a, b) => {
      executions++
      return a + b
    })
    const res1 = cachedFunc(1, 2)
    const res2 = cachedFunc(1, 2)
    const res3 = cachedFunc(2, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 4)
    assert.equal(executions, 2)
  })

  it('does not cache when throwing exceptions', async () => {
    let executions = 0
    const cachedFunc = cacheOnce((a, b) => {
      executions++
      throw new Error('error')
    })
    let res1, res2, res3
    try {
      res1 = cachedFunc(1, 2)
    } catch (e) {}
    try {
      res2 = cachedFunc(1, 2)
    } catch (e) {}
    try {
      res3 = cachedFunc(1, 2)
    } catch (e) {}

    assert.isUndefined(res1)
    assert.isUndefined(res2)
    assert.isUndefined(res3)
    assert.equal(executions, 3)
  })

  it('caches twice', async () => {
    let executions = 0
    const cachedFunc = cacheTwice((a, b) => {
      executions++
      return Promise.resolve(a + b)
    })
    const res1 = await cachedFunc(1, 2)
    const res3 = await cachedFunc(2, 2)
    const res2 = await cachedFunc(1, 2)
    const res4 = await cachedFunc(2, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 4)
    assert.equal(res4, 4)
    assert.equal(executions, 2)
  })

  it('caches with TTL', async () => {
    let executions = 0
    const cachedFunc = cacheTTL((a, b) => {
      executions++
      return Promise.resolve(a + b)
    })
    const res1 = await cachedFunc(1, 2)
    const res2 = await cachedFunc(1, 2)
    await delay(5)
    const res3 = await cachedFunc(1, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 3)
    assert.equal(executions, 2)
  })
})
