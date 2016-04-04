var assert = require('chai').assert;
var fallbackDecorator = require('../../callback/fallback');

describe('fallback (callback)', function () {
  var fallback;

  beforeEach(function () {
    fallback = fallbackDecorator(function (a, b, c, func) {
      func(undefined, 'giving up');
    });
  });

  it('must pass', function (done) {
    var f = fallback(function (a, b, c, next) {
      next(undefined, a + b + c);
    });
    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      done();
    });
  });

  it('must fallback', function (done) {
    var f = fallback(function (a, b, c, next) {
      next(new Error('error!'));
    });
    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 'giving up');
      done();
    });
  });
});
