/* eslint-env node, mocha */
import { assert } from 'chai'
import balance from '../src/balance'
import { roundRobin } from '../src/utils/balance-policies'

describe('balance', () => {
  it('must balance with round-robin algorithm', (done) => {
    let counter = 0
    const counters = [0, 0, 0]

    var balanceDecorator = balance({ policy: roundRobin })
    var func = balanceDecorator([() => Promise.resolve(0), () => Promise.resolve(1), () => Promise.resolve(2)])

    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        func()
          .then(function (res) {
            counters[res]++
            counter++
            if (counter === 40) {
              assert.deepEqual(counters, [14, 13, 13])
              done()
            }
          })
      }, 0 + (i * 5))
    }
  })

  it('changes the name of the function', () => {
    const balanceDecorator = balance(roundRobin)
    const func = balanceDecorator([function stub1 () {}, function stub2 () {}])

    assert.equal(func.name, 'balance(stub1,stub2)')
  })
})
