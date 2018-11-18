/* eslint-env node, mocha */
import { assert } from 'chai'
import onFulfilled from '../src/on-fulfilled'

describe('on-fulfilled', () => {
  it('must work', (done) => {
    const decorator = onFulfilled((res) => {
      return res * 2
    })
    const func = decorator(() => Promise.resolve(2))
    func()
      .then(function (res) {
        assert.equal(res, 4)
        done()
      })
  })
})
