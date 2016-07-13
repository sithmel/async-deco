var assert = require('chai').assert;
var parallel = require('../../promise/parallel');


describe('parallel (promise)', function () {

  it('must execute parallel functions', function () {
    var func = parallel([
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x + 1);
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x + 2);
        });
      }
    ]);

    func(3).then(function (values) {
      assert.deepEqual(values, [4, 5]);
    });
  });

  it('must fail if one fails', function () {
    var func = parallel([
      function (x) {
        return new Promise(function (resolve, reject) {
          reject(new Error('error'));
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          resolve(x + 2);
        });
      }
    ]);

    func(3).catch(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
    });
  });
});
