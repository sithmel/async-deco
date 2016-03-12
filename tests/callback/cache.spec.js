var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var cacheDecorator = require('../../callback/cache');

describe('cache (callback)', function () {
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
    var f = cached(function (a, b, c, next) {
      next(undefined, a + b + c);
    });

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      f(3, 2, 1, function (err, dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
          {type: 'cachehit', obj: {key: '1679091c5a880faf6fb5e6087eb1b2dc', result: 6}},
        ]);
        done();
      });
    });
  });

});
