/* eslint-env node, mocha */
var assert = require('chai').assert
var balance = require('../src/balance')
var balancePolicies = require('../src/utils/balance-policies')

describe('balance (promise)', function () {
  it('must balance with round-robin algorithm', function (done) {
    var counter = 0
    var counters = [0, 0, 0]

    var balanceDecorator = balance({ policy: balancePolicies.roundRobin })
    var func = balanceDecorator([() => Promise.resolve(0), () => Promise.resolve(1), () => Promise.resolve(2)])

    for (var i = 0; i < 40; i++) {
      setTimeout(function () {
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

  it('changes the name of the function', function () {
    var balanceDecorator = balance(balancePolicies.roundRobin)
    var func = balanceDecorator([function stub1 () {}, function stub2 () {}])

    assert.equal(func.name, 'balance(stub1,stub2)')
  })
})
