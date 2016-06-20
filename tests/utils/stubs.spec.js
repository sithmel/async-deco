var assert = require('chai').assert;
var stubs = require('../../utils/stubs');
var cbStub = stubs.callback;
var promiseStub = stubs.promise;

describe('cb stub', function () {
  it('must return value', function (done) {
    var stub = cbStub(1);
    stub(1, 2, 3, function (err, res) {
      assert.equal(res, 1);
      done();
    });
  });
  it('must return error', function (done) {
    var stub = cbStub(new Error('error'));
    stub(1, 2, 3, function (err, res) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
      done();
    });
  });
});

describe('promise stub', function () {
  it('must return value', function (done) {
    var stub = promiseStub(1);
    stub(1, 2, 3).then(function (res) {
      assert.equal(res, 1);
      done();
    });
  });
  it('must return error', function (done) {
    var stub = promiseStub(new Error('error'));
    stub(1, 2, 3).catch(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
      done();
    });
  });
});
