var assert = require('chai').assert;
var race = require('../../promise/race');

describe('race (promise)', function () {

  it('must return the fastest', function () {
    var func = race([
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve(x + ' world');
          }, 20);
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve(x + ' my friend');
          }, 10);
        });
      }
    ]);

    func('hello', function (err, value) {
      assert.equal(value, 'hello my friend');
    });
  });

  it('must return the fastest (non failing)', function () {
    var func = race([
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve(x + ' world');
          }, 20);
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('error!'));
          }, 10);
        });
      }
    ]);

    func('hello').then(function (value) {
      assert.equal(value, 'hello world');
    });
  });

  it('must return an error', function () {
    var func = race([
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('error 1'));
          }, 20);
        });
      },
      function (x) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('error 2'));
          }, 10);
        });
      }
    ]);

    func('hello').catch(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'error 1');
    });
  });

});
