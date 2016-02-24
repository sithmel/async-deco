var assert = require('chai').assert;
var Cache = require('memoize-cache');
var fallbackCacheDecorator = require('../../promise/fallback-cache');

describe('fallback-cache (promise)', function () {
  var cached;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    var cache = new Cache();
    cached = fallbackCacheDecorator(cache, undefined, logger);
  });


  it('must fallback using a cached value', function (done) {
    var counter = 0;
    var f = cached(function (a, b, c, next) {
      return new Promise(function (resolve, reject) {
        counter++;
        if (counter === 1) {
          resolve(a + b + c);
        }
        else {
          reject(new Error('error'));
        }
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      f(1, 2, 3).then(function (dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
         {type: 'fallback-cachehit', obj: { key: '_default', result: 6, actualResult: {err: new Error('error'), res: undefined}}},
        ]);
        done();
      });
    });
  });

  it('can\'t fallback using a cached value', function (done) {
    var counter = 0;
    var f = cached(function (a, b, c, next) {
      return new Promise(function (resolve, reject) {
        reject(new Error('error'));
      });
    });

    f(1, 2, 3).catch(function (err) {
      assert.deepEqual(err, new Error('error'));
      assert.equal(log.length, 0);
      done();
    });
  });

});
