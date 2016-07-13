var assert = require('chai').assert;
var parallel = require('../../callback/parallel');


describe('parallel', function () {

  it('must execute parallel functions', function () {
    var func = parallel([
      function (x, cb) {
        cb(null, x + 1);
      },
      function (x, cb) {
        cb(null, x + 2);
      }
    ]);

    func(3, function (err, values) {
      assert.deepEqual(values, [4, 5]);
    });
  });

  it('must fail if one fails', function () {
    var func = parallel([
      function (x, cb) {
        cb(new Error('error'));
      },
      function (x, cb) {
        cb(null, x + 2);
      }
    ]);

    func(3, function (err, values) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error');
    });
  });
});
