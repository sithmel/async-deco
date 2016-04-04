var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var fallbackCacheDecorator = require('../../callback/fallback-cache');

describe('fallback-cache (callback)', function () {
  var cached;

  beforeEach(function () {
    var cache = new Cache();
    cached = fallbackCacheDecorator(cache);
  });


  it('must fallback using a cached value', function (done) {
    var counter = 0;
    var f = cached(function (a, b, c, next) {
      counter++;
      if (counter === 1) {
        next(undefined, a + b + c);
      }
      else {
        next(new Error('error'));
      }
    });

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      f(1, 2, 3, function (err, dep) {
        assert.equal(dep, 6);
        done();
      });
    });
  });

  it('can\'t fallback using a cached value', function (done) {
    var counter = 0;
    var f = cached(function (a, b, c, next) {
      next(new Error('error'));
    });

    f(1, 2, 3, function (err, dep) {
      assert.deepEqual(err, new Error('error'));
      done();
    });
  });

});
