/* eslint-env node, mocha */
import { assert } from 'chai'
import { random, roundRobin, idlest } from '../../src/utils/balance-policies'

describe('balancePolicies', () => {
  it('balance random', () => {
    const n = random(1, [1, 2, 3])
    assert(n >= 0 && n <= 2)
  })
  it('balance round-robin', () => {
    assert.equal(1, roundRobin(1, [1, 2, 3]))
    assert.equal(1, roundRobin(4, [1, 2, 3]))
  })
  it('balance idlest', () => {
    const n = idlest(1, [10, 2, 3])
    assert.equal(1, n)
  })
})
