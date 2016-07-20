var assert = require('chai').assert;
var debounce = require('../../promise/debounce');
var throttle = require('../../promise/throttle');

describe('debounce (promise)', function () {
  var f;
  beforeEach(function () {
    var debounceDecorator = debounce(50, undefined, function (a, b) { return (a + b).toString(); });
    f = debounceDecorator(function (a, b) {
      return new Promise(function (resolve, reject) {
        resolve(a + b);
      });
    });
  });

  it('must eventually call the debounced function', function (done) {
    var t0 = Date.now();
    f(3, 4).then(function (res) {
      assert.equal(res, 7);
      t1 = Date.now();
      // console.log(t1 - t0);
      done();
    });
  });

  it('must call only once', function (done) {
    var firstCalled = false;
    f(6, 5).then(function (res) {
      firstCalled = true;
    });
    f(5, 6).then(function (res) {
      assert.equal(res, 11);
      assert.isFalse(firstCalled);
      done();
    });
  });

  it('must call twice', function (done) {
    var firstCalled = false;
    f(3, 4).then(function (res) {
      assert.equal(res, 7);
      firstCalled = true;
    });
    f(5, 6).then(function (res) {
      assert.equal(res, 11);
      assert.isTrue(firstCalled);
      done();
    });
  });
});

describe('throttle (promise)', function () {
  var f;
  beforeEach(function () {
    var throttleDecorator = throttle(50, undefined, function (a, b) { return (a + b).toString(); });
    f = throttleDecorator(function (a, b) {
      return new Promise(function (resolve, reject) {
        resolve(a + b);
      });
    });
  });

  it('must eventually call the throttled function', function (done) {
    var t0 = Date.now();
    f(3, 4).then(function (res) {
      assert.equal(res, 7);
      t1 = Date.now();
      // console.log(t1 - t0);
      done();
    });
  });


  it('must call twice', function (done) {
    var firstCalled = false;
    f(3, 4).then(function (res) {
      assert.equal(res, 7);
      firstCalled = true;
    });
    f(5, 6).then(function (res) {
      assert.equal(res, 11);
      assert.isTrue(firstCalled);
      done();
    });
  });
});
