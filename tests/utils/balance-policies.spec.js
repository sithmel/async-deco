var assert = require('chai').assert;
var balancePolicies = require('../../utils/balance-policies');

describe('balancePolicies', function () {
  it('balance random', function () {
    var n = balancePolicies.random(1, [1, 2, 3]);
    assert(n >= 0 && n <= 2);
  });
  it('balance round-robin', function () {
    assert.equal(1, balancePolicies.roundRobin(1, [1, 2, 3]));
    assert.equal(1, balancePolicies.roundRobin(4, [1, 2, 3]));
  });
  it('balance idlest', function () {
    var n = balancePolicies.idlest(1, [10, 2, 3]);
    assert.equal(1, n);
  });
});
