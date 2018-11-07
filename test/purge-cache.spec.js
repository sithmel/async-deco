/* eslint-env node, mocha */
import { assert } from 'chai'
import { CacheRAM } from 'memoize-cache'
import cacheDecorator from '../src/cache'
import purgeCacheDecorator from '../src/purge-cache'

describe('purge-cache', () => {
  let cached, purgeCache, purgeCacheByTags

  beforeEach(() => {
    const getKey = (key) => key
    const getKeys = (key) => [key]
    const getTags = () => ['tag']
    const cache = new CacheRAM({ key: getKey, tags: getTags })
    cached = cacheDecorator({ cache })
    purgeCache = purgeCacheDecorator({ cache, keys: getKeys })
    purgeCacheByTags = purgeCacheDecorator({ cache, tags: getTags })
  })

  it('must cache', (done) => {
    const f = cached((a, b, c) => {
      return Promise.resolve(Math.random())
    })

    f(1, 2, 3).then((res1) => {
      f(1, 2, 3).then((res2) => {
        assert.equal(res1, res2)
        done()
      })
    })
  })

  it('must purge cache', (done) => {
    const f = cached(function (a, b, c) {
      return Promise.resolve(Math.random())
    })

    const purgeF = purgeCache(function (a) {
      return Promise.resolve()
    })

    f(1, 2, 3).then((res1) => {
      purgeF(1).then(() => {
        f(1, 2, 3).then((res2) => {
          assert.notEqual(res1, res2)
          done()
        })
      })
    })
  })

  it('must not purge cache if error', (done) => {
    const f = cached(function (a, b, c) {
      return Promise.resolve(Math.random())
    })

    const purgeF = purgeCache((a) => {
      return Promise.reject(new Error())
    })

    f(1, 2, 3).then((res1) => {
      purgeF(1).catch(() => {
        f(1, 2, 3).then((res2) => {
          assert.equal(res1, res2)
          done()
        })
      })
    })
  })

  it('must purge cache by tags', (done) => {
    const f = cached((a, b, c) => {
      return Promise.resolve(Math.random())
    })

    const purgeF = purgeCacheByTags((a) => {
      return Promise.resolve()
    })

    f(1, 2, 3).then((res1) => {
      purgeF(1).then(() => {
        f(1, 2, 3).then((res2) => {
          assert.notEqual(res1, res2)
          done()
        })
      })
    })
  })
})
