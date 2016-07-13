var assert = require('chai').assert;
var race = require('../../callback/race');

describe('race', function () {

  it('must return the fastest', function () {
    var func = race([
      function (x, cb) {
        setTimeout(function () {
          cb(null, x + ' world');
        }, 20);
      },
      function (x, cb) {
        setTimeout(function () {
          cb(null, x + ' my friend');
        }, 10);
      }
    ]);

    func('hello', function (err, value) {
      assert.equal(value, 'hello my friend');
    });
  });

  it('must return the fastest (non failing)', function () {
    var func = race([
      function (x, cb) {
        setTimeout(function () {
          cb(null, x + ' world');
        }, 20);
      },
      function (x, cb) {
        setTimeout(function () {
          cb(new Error('error!'));
        }, 10);
      }
    ]);

    func('hello', function (err, value) {
      assert.equal(value, 'hello world');
    });
  });

  it('must return an error', function () {
    var func = race([
      function (x, cb) {
        setTimeout(function () {
          cb(new Error('error 1'));
        }, 20);
      },
      function (x, cb) {
        setTimeout(function () {
          cb(new Error('error 2'));
        }, 10);
      }
    ]);

    func('hello', function (err, value) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error 1');
    });
  });

});
