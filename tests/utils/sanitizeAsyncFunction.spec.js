var assert = require('chai').assert;
var sanitizeAsyncFunction = require('../../utils/sanitizeAsyncFunction');

describe('safe', function () {
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

  it('must catch double called callback', function (done) {
    var firstTime = true;

    var func = sanitizeAsyncFunction(function (a, b, cb) {
      cb(null, a + b);
      cb(null, a + b);
    });

    func(1, 2, function (err, out) {
      if (firstTime) {
        assert.equal(out, 3);
        firstTime = false;
      }
      else {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Callback fired twice');
        done();
      }
    });
  });

});
