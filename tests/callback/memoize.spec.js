var assert = require('chai').assert;
var memoizeDecorator = require('../../callback/memoize');

describe('memoize (callback)', function () {
  var simpleMemoize, complexMemoize;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    simpleMemoize = memoizeDecorator(undefined, logger);
    complexMemoize = memoizeDecorator(function (a, b, c) {
      return a + b + c;
    }, logger);
  });

  it('must memoize with any parameter', function (done) {
    var f = simpleMemoize(function (a, b, c, next) {
      next(undefined, a + b + c);
    });

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      f(8, function (err, dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
          {type: 'cachehit', obj: {key: '_default', result: 6}},
        ]);
        done();
      });
    });
  });

  it('must memoize using different keys', function (done) {
    var f = complexMemoize(function (a, b, c, next) {
      next(undefined, a + b + c);
    });

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      f(3, 2, 1, function (err, dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
          {type: 'cachehit', obj: {key: '6', result: 6}},
        ]);
        done();
      });
    });
  });

});
