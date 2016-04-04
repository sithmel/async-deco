var assert = require('chai').assert;
var proxyDecorator = require('../../promise/proxy');

describe('proxy (promise)', function () {
  var proxy;

  beforeEach(function () {
    proxy = proxyDecorator(function (number, cb) {
      cb(number % 2 === 0 ? new Error('Evens not allowed') : undefined);
    });
  });

  it('must pass', function (done) {
    var func = proxy(function (number, cb) {
      return new Promise(function (resolve, reject) {
        resolve(number * 2);
      });
    });

    func(3).then(function (res) {
      assert.equal(res, 6);
      done();
    });
  });

  it('must throw', function (done) {
    var func = proxy(function (number, cb) {
      return new Promise(function (resolve, reject) {
        resolve(number * 2);
      });
    });

    func(2).catch(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Evens not allowed');
      done();
    });
  });
});
