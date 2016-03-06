var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var cacheDecorator = require('../../promise/cache');

describe('cache (promise)', function () {
  var cached;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    var cache = new Cache({key: function (a, b, c) {
      return a + b + c;
    }});
    cached = cacheDecorator(cache, logger);
  });


  it('must cache using different keys', function (done) {
    var f = cached(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      f(3, 2, 1).then(function (dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
          {type: 'cachehit', obj: {key: '6', result: 6}},
        ]);
        done();
      });
    });
  });

});
