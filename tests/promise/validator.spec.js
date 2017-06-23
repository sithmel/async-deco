var assert = require('chai').assert;
var validatorDecorator = require('../../promise/validator');
var match = require('occamsrazor-match');
var or = require('occamsrazor-match/extra/or');

describe('validator (promise)', function () {

  it('must pass validation', function (done) {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool) {
      return new Promise(function (resolve, reject) {
        resolve(number);
      });
    });

    func(1, true).then(function (res) {
      assert.equal(res, 1);
      done();
    });
  });

  it('must pass validation (with extra arg)', function (done) {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool, extra) {
      return new Promise(function (resolve, reject) {
        resolve(number);
      });
    });

    func(1, true, 'extra').then(function (res) {
      assert.equal(res, 1);
      done();
    });
  });

  it('must not pass validation', function (done) {
    var validator = validatorDecorator(2, or([false, true]));

    var func = validator(function (number, bool) {
      return new Promise(function (resolve, reject) {
        resolve(number);
      });
    });

    func(1, true).catch(function (err) {
      assert.equal(err.message, 'Function called with wrong arguments: array:[isNumber:2,or(isFalse isTrue)]');
      done();
    });
  });
});
