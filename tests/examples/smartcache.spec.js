var assert = require('chai').assert;
var Cache = require('memoize-cache').ramCache;
var dedupeDecorator = require('../../callback/dedupe');
var cacheDecorator = require('../../callback/cache');
var compose = require('../../utils/compose');

describe('smartcache (callback)', function () {
  var cache, dedupe;

  beforeEach(function () {
    var maxAge = 120;
    var cacheObj = new Cache({maxAge: maxAge});

    cache = cacheDecorator(cacheObj);
    dedupe = dedupeDecorator();
  });

  it('must dedupe function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = dedupe(function (a, next) {
      numberRuns++;
      setTimeout(function () {
        next(undefined, a);
      }, 20); // latency
    });

    for (var i = 0; i < 20; i++) {
      setTimeout((function (t) {
        return function () {
          f(t, function (err, res) {
            numberCBRuns++;
            if (numberCBRuns === 20) {
              assert(numberRuns === 4 || numberRuns === 5);
              done();
            }
          });
        };
      }(i)), i * 5);
    }

  });

  it('must dedupe/cache function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;
    var smartcache = compose(dedupe, cache);

    var f = smartcache(function (a, next) {
      numberRuns++;
      setTimeout(function () {
        next(undefined, a);
      }, 20); // latency
    });

    for (var i = 0; i < 20; i++) {
      setTimeout((function (t) {
        return function () {
          f(t, function (err, res) {
            numberCBRuns++;
            if (numberCBRuns === 20) {
              assert.equal(numberRuns, 1);
              done();
            }
          });
        };
      }(i)), i * 5);
    }
  });
});
