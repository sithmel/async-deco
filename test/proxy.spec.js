/* eslint-env node, mocha */
import { assert } from 'chai'
import proxyDecorator from '../src/proxy'

describe('proxy', () => {
  let proxied

  beforeEach(() => {
    const proxy = proxyDecorator({ guard: (number) => {
      if (number % 2 === 0) {
        return Promise.reject(new Error('Evens not allowed'))
      }
      return Promise.resolve(undefined)
    } })
    proxied = proxy((number) => Promise.resolve(number * 2))
  })

  it('must pass', (done) => {
    proxied(3).then(function (res) {
      assert.equal(res, 6)
      done()
    })
  })

  it('must throw', (done) => {
    proxied(2).catch((err) => {
      assert.instanceOf(err, Error)
      assert.equal(err.message, 'Evens not allowed')
      done()
    })
  })
})
