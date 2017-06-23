var assert = require('chai').assert;
var validatorDecorator = require('../../utils/validator');
var match = require('occamsrazor-match');
var or = require('occamsrazor-match/extra/or');

describe('validator (callback)', function () {

  it('must pass validation', function () {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool) {
      return number;
    });

    assert.equal(func(1, true), 1);
  });

  it('must pass validation (with extra arg)', function () {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool, extra) {
      return number;
    });

    assert.equal(func(1, true), 1);
  });

  it('must not pass validation', function () {
    var validator = validatorDecorator(1, or([false, true]));

    var func = validator(function (number, bool) {
      return number;
    });

    assert.throw(function () { func(2, true); }, Error);
  });
});
