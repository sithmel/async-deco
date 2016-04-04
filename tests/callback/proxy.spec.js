var assert = require('chai').assert;
var proxyDecorator = require('../../callback/proxy');

describe('proxy (callback)', function () {
  var proxy;

  beforeEach(function () {
    proxy = proxyDecorator(function (number, cb) {
      cb(number % 2 === 0 ? new Error('Evens not allowed') : undefined);
    });
  });

  it('must pass', function (done) {
    var func = proxy(function (number, cb) {
      cb(null, number * 2);
    });

    func(3, function (err, res) {
      assert.equal(res, 6);
      assert.isNull(err);
      done();
    });
  });

  it('must throw', function (done) {
    var func = proxy(function (number, cb) {
      cb(null, number * 2);
    });

    func(2, function (err, res) {
      assert.isUndefined(res);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Evens not allowed');
      done();
    });
  });

});
