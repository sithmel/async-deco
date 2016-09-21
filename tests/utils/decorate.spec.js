var assert = require('chai').assert;
var decorate = require('../../utils/decorate');

var fallbackDecorator = require('../../callback/fallback');
var logDecorator = require('../../callback/log');
var addLogger = require('../../utils/add-logger');
var timeoutDecorator = require('../../callback/timeout');
var retryDecorator = require('../../callback/retry');

describe('decorate', function () {

  it('must decorate multiple arguments', function () {
    var add  = function add(a, b) { return a + b; };
    var square = function square(f) {
      return function (a,b) {
        return f(a, b) * f(a, b);
      };
    };
    var f = decorate(square, add);
    assert.equal(f(3,2), 25);
  });

  it('must decorate complex scenarios', function (done) {
    var log = [];
    var logger = function (type, obj, ts) {
      log.push({type: type, obj: obj});
    };

    var f = decorate(
      addLogger(logger),
      logDecorator(),
      fallbackDecorator(function (a, b, c, func) {
        func(null, 'no value');
      }, Error),
      retryDecorator(2, undefined, Error),
      timeoutDecorator(20),
      function (a, b, c, next) {
        next(null, a + b + c);
      }
    );

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.deepEqual(log, [
         { type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context} },
         { type: 'log-end', obj: { result: 6 } }
      ]);
      done();
    });
  });

  it('must be able to take one function', function (done) {
    var f = decorate(
      function (a, b, c, next) {
        next(null, a + b + c);
      }
    );

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      done();
    });
  });

  it('must work with sparse arrays', function (done) {
    var log = [];
    var logger = function (type, obj, ts) {
      log.push({type: type, obj: obj});
    };

    var f = decorate([
      addLogger(logger),
      undefined,
      logDecorator(),
      fallbackDecorator(function (a, b, c, func) {
        func(null, 'no value');
      }, Error),
      undefined,
      retryDecorator(2, undefined, Error),
      timeoutDecorator(20),
      function (a, b, c, next) {
        next(null, a + b + c);
      }
    ]);

    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.deepEqual(log, [
         { type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context} },
         { type: 'log-end', obj: { result: 6 } }
      ]);
      done();
    });
  });
});
