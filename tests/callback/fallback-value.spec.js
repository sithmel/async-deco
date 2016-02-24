var assert = require('chai').assert;
var fallbackDecorator = require('../../callback/fallback-value');

describe('fallback-value (callback)', function () {
  var fallback;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    fallback = fallbackDecorator('giving up', undefined, logger);
  });

  it('must pass', function (done) {
    var f = fallback(function (a, b, c, next) {
      next(undefined, a + b + c);
    });
    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      done();
    });
  });

  it('must fallback', function (done) {
    var f = fallback(function (a, b, c, next) {
      next(new Error('error!'));
    });
    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 'giving up');
      assert.deepEqual(log[0], {type: 'fallback', obj: { actualResult: {err: new Error('error!'), res: undefined}}});
      done();
    });
  });
});
