var assert = require('chai').assert;
var sanitizeAsyncFunction = require('../../utils/sanitizeAsyncFunction');

describe('sanitizeAsyncFunction', function () {
  it('must execute function', function (done) {
    var func = sanitizeAsyncFunction(function (a, b, cb) {
      cb(null, a + b);
    });

    func(1, 2, function (err, out) {
      assert.equal(out, 3);
      done();
    });
  });

  it('must catch exceptions', function (done) {
    var func = sanitizeAsyncFunction(function () {
      throw new Error('generic error');
    });

    func(function (err, out) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'generic error');
      done();
    });
  });

  it('must catch double called callback', function () {
    var firstTime = true;

    var func = sanitizeAsyncFunction(function (a, b, cb) {
      cb(null, a + b);
      cb(null, a + b);
    });

    assert.throws(function () {
      func(1, 2, function (err, out) {
        assert.isTrue(firstTime);
        assert.equal(out, 3);
        firstTime = false;
      });
    }, 'Callback fired twice');
  });

  it('must catch double called callback (2)', function () {
    var firstTime = true;

    var func = sanitizeAsyncFunction(function (a, b, cb) {
      cb(null, a + b);
      throw new Error('generic error');
    });

    assert.throws(function () {
      func(1, 2, function (err, out) {
        assert.isTrue(firstTime);
        assert.equal(out, 3);
        firstTime = false;
      });
    }, 'generic error');
  });

  it('must catch and throw errors on the callback', function () {
    var firstTime = true;

    var func = sanitizeAsyncFunction(function (a, b, cb) {
      cb(null, a + b);
    });

    assert.throws(function () {
      func(1, 2, function (err, out) {
        assert.isTrue(firstTime);
        firstTime = false;
        throw(new Error('callback broken'));
      });
    }, 'callback broken');
  });
});
