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

  it('must cache', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random());
    });

    f(1, 2, 3, function (err, res1) {
      f(3, 2, 1, function (err, res2) {
        assert.equal(res1, res2);
        done();
      });
    });
  });

  it('must not cache (error)', function (done) {
    var counter = 0;
    var f = cached(function (a, b, c, next) {
      counter++;
      if (counter % 2 !== 0) {
        return next(new Error(), 'error');
      }
      return next(undefined, 'ok');
    });

    f(1, 2, 3, function (err, res1) {
      f(3, 2, 1, function (err, res2) {
        assert.equal(res1, 'error');
        assert.equal(res2, 'ok');
        done();
      });
    });
  });

  it('must cache (error)', function (done) {
    var cache = new Cache({key: function (a, b, c) {
      return a + b + c;
    }});
    var cached = cacheDecorator(cache, { error: function (err, res) {
      return !(err instanceof Error);
    } });

    var counter = 0;
    var f = cached(function (a, b, c, next) {
      counter++;
      if (counter % 2 !== 0) {
        return next(new Error(), 'error');
      }
      return next(undefined, 'ok');
    });

    f(1, 2, 3, function (err, res1) {
      f(3, 2, 1, function (err, res2) {
        assert.equal(res1, res2);
        assert.equal(res1, 'error');
        done();
      });
    });
  });
});
