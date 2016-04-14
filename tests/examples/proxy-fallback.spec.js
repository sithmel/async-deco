var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var proxyDecorator = require('../../callback/proxy');
var fallbackValueDecorator = require('../../callback/fallback-value');
var compose = require('../../utils/compose');

describe('proxy fallback (callback)', function () {
  var proxy, fallbackValue, decorator;

  beforeEach(function () {
    proxy = proxyDecorator(function (number, cb) {
      cb(number % 2 === 0 ? new Error('Evens not allowed') : undefined);
    });
    fallbackValue = fallbackValueDecorator('evens');
    decorator = compose(fallbackValue, proxy);
  });

  it('must not fallback', function (done) {
    var f = decorator(function (n, cb) {
      cb(null, n * 2);
    });
    f(3, function (err, value) {
      assert.equal(value, 6);
      done();
    });
  });

  it('must fallback', function (done) {
    var f = decorator(function (n, cb) {
      cb(null, n * 2);
    });
    f(2, function (err, value) {
      assert.equal(value, 'evens');
      done();
    });
  });

});
