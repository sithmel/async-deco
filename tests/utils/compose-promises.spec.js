var assert = require('chai').assert;
var compose = require('../../utils/compose');
var callbackify = require('../../utils/callbackify');
var fallbackDecorator = require('../../callback/fallback');
var timeoutDecorator = require('../../callback/timeout');
var logDecorator = require('../../callback/log');
var addLogger = require('../../utils/add-logger');
var retryDecorator = require('../../callback/retry');
var promiseTranslator = require('../../src/promise-translator');
var TimeoutError = require('../../errors/timeout-error');

describe('compose promises', function () {
  var decorator;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function (type, obj, ts) {
      log.push({type: type, obj: obj});
    };

    decorator = compose(
      addLogger(logger),
      promiseTranslator(logDecorator()),
      promiseTranslator(fallbackDecorator(function (a, b, c, func) {
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
      assert.deepEqual(log, [
         {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}},
         { type: 'log-end', obj: { result: 6 } }
      ]);
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
