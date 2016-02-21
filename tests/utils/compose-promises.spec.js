var assert = require('chai').assert;
var compose = require('../../utils/compose');
var callbackify = require('../../utils/callbackify');
var fallbackDecorator = require('../../callback/fallback');
var timeoutDecorator = require('../../callback/timeout');
var retryDecorator = require('../../callback/retry');
var promiseTranslator = require('../../src/promise-translator');
var TimeoutError = require('../../errors/timeout-error');

describe('compose promises', function () {
  var decorator;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function (type, obj) {
      log.push({type: type, obj: obj});
    };

    decorator = compose(
      promiseTranslator(fallbackDecorator(function (err, a, b, c, func) {
        func(null, 'no value');
      }, Error, logger)),
      promiseTranslator(retryDecorator(2, undefined, Error, logger)),
      promiseTranslator(timeoutDecorator(20, logger)));
  });

  it('must go through', function (done) {
    var f = decorator(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      assert.equal(log.length, 0);
      done();
    });
  });

  it('must return no value', function (done) {
    var f = decorator(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a + b + c);
        }, 30);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 'no value');
      assert.deepEqual(log[0], { type: 'timeout', obj: { ms: 20 }});
      assert.deepEqual(log[1], { type: 'retry', obj: { times: 1 }});
      assert.deepEqual(log[2], { type: 'timeout', obj: { ms: 20 }});
      assert.equal(log[3].type, 'fallback');
      assert.isUndefined(log[3].obj.actualResult.res);
      assert.instanceOf(log[3].obj.actualResult.err, TimeoutError);
      done();
    });
  });

  it('must return value after retrying', function (done) {
    var counter = 0;

    var f = decorator(function (a, b, c) {
      counter++;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a + b + c);
        }, 30/counter);
      });
    });

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      assert.deepEqual(log,
        [ { type: 'timeout', obj: { ms: 20 } },
          { type: 'retry', obj: { times: 1 } }]);
      done();
    });
  });

});
