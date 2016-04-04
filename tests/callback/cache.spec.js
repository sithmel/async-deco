var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var cacheDecorator = require('../../callback/cache');

describe('cache (callback)', function () {
  var cached;

  beforeEach(function () {
    var cache = new Cache({key: function (a, b, c) {
      return a + b + c;
    }});
    cached = cacheDecorator(cache);
  });


  it('must cache using different keys', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, a + b + c);
    });

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      f(3, 2, 1, function (err, dep) {
        assert.equal(dep, 6);
        done();
      });
    });
  });

});
