var assert = require('chai').assert;
var validatorDecorator = require('../../callback/validator');
var match = require('occamsrazor-match');
var or = require('occamsrazor-match/extra/or');

describe('validator (callback)', function () {

  it('must pass validation', function (done) {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool, cb) {
      cb(null, number);
    });

    func(1, true, function (err, res) {
      assert.equal(res, 1);
      done();
    });
  });

  it('must pass validation (with extra arg)', function (done) {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool, extra, cb) {
      cb(null, number);
    });

    func(1, true, 'extra', function (err, res) {
      assert.equal(res, 1);
      done();
    });
  });

  it('must not pass validation', function (done) {
    var validator = validatorDecorator(2, or([false, true]));

    var func = validator(function (number, bool, cb) {
      cb(null, number);
    });

    func(1, true, function (err, res) {
      assert.isUndefined(res);
      assert.equal(err.message, 'Function called with wrong arguments: array:[isNumber:2,or(isFalse isTrue)]');
      assert.deepEqual(err.errors, [
        { path: '[0]', name: 'isNumber:2', value: 1 }]);
      done();
    });
  });
});
