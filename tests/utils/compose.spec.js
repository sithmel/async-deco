var assert = require('chai').assert;
var compose = require('../../utils/compose');
var callbackify = require('../../utils/callbackify');
var fallbackDecorator = require('../../callback/fallback');
var logDecorator = require('../../callback/log');
var addLogger = require('../../utils/add-logger');
var timeoutDecorator = require('../../callback/timeout');
var retryDecorator = require('../../callback/retry');
var TimeoutError = require('../../errors/timeout-error');

describe('compose', function () {

  it('must compose simple functions', function () {
    var square = function (n) { return n*n; };
    var add10  = function (n) { return n + 10; };
    var f = compose(add10, square);
    assert.equal(f(3), 19);
  });

  it('must compose simple functions with more than one arg', function () {
    var sum = function (a, b) { return a + b; };
    var add10  = function (n) { return n + 10; };
    var f = compose(add10, sum);
    assert.equal(f(3, 4), 17);
  });

  it('must ignore undefined', function () {
    var square = function (n) { return n*n; };
    var add10  = function (n) { return n + 10; };
    var f = compose(add10, undefined, square);
    assert.equal(f(3), 19);
  });

  it('can take an array as argument', function () {
    var square = function (n) { return n*n; };
    var add10  = function (n) { return n + 10; };
    var f = compose([add10, undefined, square]);
    assert.equal(f(3), 19);
  });

  describe('complex functions', function () {
    var decorator;
    var log;

    beforeEach(function () {
      log = [];
      var logger = function (type, obj, ts) {
        log.push({type: type, obj: obj});
      };

      decorator = compose(
        addLogger(logger),
        logDecorator(),
        fallbackDecorator(function (a, b, c, func) {
          func(null, 'no value');
        }, Error),
        retryDecorator(2, undefined, Error),
        timeoutDecorator(20)
      );
    });

    it('must go through', function (done) {
      var f = decorator(function (a, b, c, next) {
        next(null, a + b + c);
      });

      f(1, 2, 3, function (err, dep) {
        assert.equal(dep, 6);
        assert.deepEqual(log, [
           { type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context} },
           { type: 'log-end', obj: { result: 6 } }
        ]);
        done();
      });
    });

    it('must return no value', function (done) {
      var f = decorator(function (a, b, c, next) {
        setTimeout(function () {
          next(null, a + b + c);
        }, 30);
      });

      f(1, 2, 3, function (err, dep) {
        assert.equal(dep, 'no value');
        assert.deepEqual(log[0], { type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context} });
        assert.deepEqual(log[1], { type: 'timeout', obj: { ms: 20 }});

        assert.equal(log[2].type, 'retry');
        assert.equal(log[2].obj.times, 1);
        assert.isUndefined(log[2].obj.actualResult.res);
        assert.instanceOf(log[2].obj.actualResult.err, TimeoutError);

        assert.deepEqual(log[3], { type: 'timeout', obj: { ms: 20 }});
        assert.equal(log[4].type, 'fallback');
        assert.isUndefined(log[4].obj.actualResult.res);
        assert.instanceOf(log[4].obj.actualResult.err, TimeoutError);
        assert.deepEqual(log[5], { type: 'log-end', obj: { result: 'no value' } });
        done();
      });
    });

    it('must return value after retrying', function (done) {
      var counter = 0;

      var f = decorator(function (a, b, c, next) {
        counter++;
        setTimeout(function () {
          next(null, a + b + c);
        }, 30/counter);
      });

      f(1, 2, 3, function (err, dep) {
        assert.equal(dep, 6);

        assert.deepEqual(log[0], { type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context} });
        assert.deepEqual(log[1], { type: 'timeout', obj: { ms: 20 }});
        assert.equal(log[2].type, 'retry');
        assert.equal(log[2].obj.times, 1);
        assert.isUndefined(log[2].obj.actualResult.res);
        assert.instanceOf(log[2].obj.actualResult.err, TimeoutError);
        assert.deepEqual(log[3], { type: 'log-end', obj: { result: 6 } });
        done();
      });
    });

  });

});
