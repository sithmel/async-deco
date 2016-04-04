var assert = require('chai').assert;
var memoizeDecorator = require('../../promise/memoize');

describe('memoize (promise)', function () {
  var simpleMemoize, complexMemoize;

  beforeEach(function () {
    simpleMemoize = memoizeDecorator();
    complexMemoize = memoizeDecorator(function (a, b, c) {
      return a + b + c;
    });
  });

  it('must memoize with any parameter', function (done) {
    var f = simpleMemoize(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      f(8).then(function (dep) {
        assert.equal(dep, 6);
        done();
      });
    });
  });

  it('must memoize using different keys', function (done) {
    var f = complexMemoize(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      f(3, 2, 1).then(function (dep) {
        assert.equal(dep, 6);
        done();
      });
    });
  });
});
