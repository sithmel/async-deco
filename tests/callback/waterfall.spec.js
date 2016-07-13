var assert = require('chai').assert;
var waterfall = require('../../callback/waterfall');
var parallel = require('../../callback/parallel');

describe('waterfall', function () {

  it('must execute waterfall functions', function () {
    var func = waterfall([
      function (x, cb) {
        cb(null, x + ' world');
      },
      function (x, cb) {
        cb(null, x + '!');
      }
    ]);

    func('hello', function (err, value) {
      assert.equal(value, 'hello world!');
    });
  });

  it('must fail if one fails', function () {
    var executed = false;
    var func = waterfall([
      function (x, cb) {
        cb(new Error('error'));
      },
      function (x, cb) {
        executed = true;
        cb(null, x + 2);
      }
    ]);

    func(3, function (err, value) {
      assert.isFalse(executed);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
    });
  });

});

describe('waterfall and parallel', function () {

  it('must execute mix waterfall and parallel', function () {
    var func = waterfall([
      parallel([
        function (x, cb) {
          cb(null, x * 2);
        },
        function (x, cb) {
          cb(null, x * 3);
        }
      ]),
      function (numbers, cb) {
        cb(null, numbers.reduce(function (acc, item) {
          return acc + item;
        }, 0));
      },
      function (x, cb) {
        cb(null, x - 5);
      }
    ]);

    func(5, function (err, value) {
      assert.equal(value, 20);
    });
  });
});
