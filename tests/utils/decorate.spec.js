var assert = require('chai').assert;
var decorate = require('../../utils/decorate');

var fallbackDecorator = require('../../callback/fallback');
var logDecorator = require('../../callback/log');
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
    var logger = function (name, id, ts, type, obj) {
      log.push({type: type, obj: obj});
    };

    var f = decorate(
      logDecorator(logger),
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
         { type: 'start', obj: undefined },
         { type: 'end', obj: { result: 6 } }
      ]);
      done();
    });
  });
});
