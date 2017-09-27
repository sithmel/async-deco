var assert = require('chai').assert;
var Cache = require('memoize-cache').CacheRAM;
var cacheDecorator = require('../../callback/cache');
var purgeCacheDecorator = require('../../callback/purge-cache');

describe('purge-cache (callback)', function () {
  var cached, purgeCache, purgeCacheByTags;

  beforeEach(function () {
    var getKey = function (key) {
      return key;
    };

    var getKeys = function (key) {
      return [key];
    };
    var getTags = function () {
      return ['tag'];
    };
    var cache = new Cache({ key: getKey, tags: getTags });
    cached = cacheDecorator(cache);
    purgeCache = purgeCacheDecorator(cache, { keys: getKeys });
    purgeCacheByTags = purgeCacheDecorator(cache, { tags: getTags });
  });

  it('must cache', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random());
    });

    f(1, 2, 3, function (err, res1) {
      f(1, 2, 3, function (err, res2) {
        assert.equal(res1, res2);
        done();
      });
    });
  });

  it('must purge cache', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random());
    });

    var purgeF = purgeCache(function (a, next) {
      next();
    });

    f(1, 2, 3, function (err, res1) {
      purgeF(1, function () {
        f(1, 2, 3, function (err, res2) {
          assert.notEqual(res1, res2);
          done();
        });
      });
    });
  });

  it('must not purge cache if error', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random());
    });

    var purgeF = purgeCache(function (a, next) {
      next(new Error());
    });

    f(1, 2, 3, function (err, res1) {
      purgeF(1, function () {
        f(1, 2, 3, function (err, res2) {
          assert.equal(res1, res2);
          done();
        });
      });
    });
  });

  it('must purge cache by tags', function (done) {
    var f = cached(function (a, b, c, next) {
      next(undefined, Math.random());
    });

    var purgeF = purgeCacheByTags(function (a, next) {
      next();
    });

    f(1, 2, 3, function (err, res1) {
      purgeF(3, function () {
        f(1, 2, 3, function (err, res2) {
          assert.notEqual(res1, res2);
          done();
        });
      });
    });
  });
});
