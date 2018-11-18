/* eslint-env node, mocha */
import { assert } from 'chai'
import onRejected from '../src/on-rejected'

describe('on-rejected', () => {
  it('must work', (done) => {
    const decorator = onRejected((err) => {
      return `msg: ${err.message}`
    })
    const func = decorator(() => Promise.reject(new Error('oh no')))
    func()
      .then(function (res) {
        assert.equal(res, 'msg: oh no')
        done()
      })
  })
})
