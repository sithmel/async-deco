var assert = require('chai').assert;
var waterfall = require('../../promise/waterfall');
var parallel = require('../../promise/parallel');

describe('waterfall (promise)', function () {

  it('must execute waterfall functions', function () {
    var func = waterfall([
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x + ' world');
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x + '!');
        });
      }
    ]);

    func('hello').then(function (value) {
      assert.equal(value, 'hello world!');
    });
  });

  it('must fail if one fails', function () {
    var executed = false;
    var func = waterfall([
      function (x) {
        return new Promise(function (resolve, reject) {
          reject(new Error('error'));
        });
      },
      function (x) {
        executed = true;
        return new Promise(function (resolve, reject) {
          resolve(x + 2);
        });
      }
    ]);

    func(3).catch(function (err) {
      assert.isFalse(executed);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
    });
  });

});

describe('waterfall and parallel (promise)', function () {

  it('must execute mix waterfall and parallel', function () {
    var func = waterfall([
      parallel([
        function (x) {
          return new Promise(function (resolve, reject) {
            resolve(x * 2);
          });
        },
        function (x) {
          return new Promise(function (resolve, reject) {
            resolve(x * 3);
          });
        }
      ]),
      function (numbers) {
        return new Promise(function (resolve, reject) {
          resolve(numbers.reduce(function (acc, item) {
            return acc + item;
          }, 0));
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x - 5);
        });
      }
    ]);

    func(5).then(function (value) {
      assert.equal(value, 20);
    });
  });
});
