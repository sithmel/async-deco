var assert = require('chai').assert;
var timeout = require('../../callback/timeout');
var TimeoutError = require('../../errors/timeout-error');

describe('timeout (promise)', function () {
  var timeout20;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    timeout20 = timeout(20, logger);
  });

  it('must pass simple function', function (done) {
    var func = timeout20(function (cb) {
      cb(null, 'done');
    });

    func(function (err, res) {
      assert.equal(res, 'done');
      assert.equal(log.length, 0);
      done();
    });
  });

  it('must pass simple function (async)', function (done) {
    var func = timeout20(function (cb) {
      setTimeout(function () {
        cb(null, 'done');
      }, 10);
    });

    func(function (err, res) {
      assert.equal(res, 'done');
      assert.equal(log.length, 0);
      done();
    });
  });

  it('must pass simple function (async) with args', function (done) {
    var func = timeout20(function (a, b, cb) {
      setTimeout(function () {
        cb(null, a + b);
      }, 10);
    });

    func(5, 6, function (err, res) {
      assert.equal(res, 11);
      done();
    });
  });

  it('must throw simple function', function (done) {
    var func = timeout20(function (cb) {
      setTimeout(function () {
        cb(null, 'done');
      }, 25);
    });

    func(function (err, res) {
      assert.isUndefined(res);
      assert.instanceOf(err, TimeoutError);
      assert.equal(log.length, 1);
      done();
    });
  });


});
