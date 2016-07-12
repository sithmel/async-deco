var assert = require('chai').assert;
var balance = require('../../promise/balance');
var balancePolicies = require('../../utils/balance-policies');
var stubs = require('../../utils/stubs');
var cbStub = stubs.promise;

describe('balance (promise)', function () {

  it('must balance with round-robin algorithm', function (done) {
    var counter = 0;
    var counters = [0, 0, 0];

    var balanceDecorator = balance(balancePolicies.roundRobin);
    var func = balanceDecorator([cbStub(0, 20),cbStub(1, 40), cbStub(2, 80)]);

    for (var i = 0; i < 40; i++) {
      setTimeout(function () {
        func()
        .then(function (res) {
          counters[res]++;
          counter++;
          if (counter === 40) {
            assert.deepEqual(counters, [14, 13, 13]);
            done();
          }
        });
      }, 0 + (i * 5));
    }
  });
});
