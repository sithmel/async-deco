var assert = require('chai').assert;
var dedupeDecorator = require('../../promise/dedupe');

describe('dedupe (promise)', function () {
  var dedupe, dedupeKey;
  var log;

  beforeEach(function () {
    dedupe = dedupeDecorator();
    dedupeKey = dedupeDecorator(function (n) { return n % 2 === 0 ? 'even' : 'odd'; });
  });

  it('must dedupe function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = dedupe(function (a) {
      numberRuns++;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a);
        }, 0);
      });
    });

    f('a').then(function (res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('b').then(function (res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('c').then(function (res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('d').then(function (res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('e').then(function (res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    setTimeout(function () {
      assert.equal(numberRuns, 1);
      assert.equal(numberCBRuns, 5);
      done();
    }, 60);

  });

  it('must dedupe a function using a key', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = dedupeKey(function (a) {
      numberRuns++;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a);
        }, 0);
      });
    });

    f(1).then(function (res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    f(2).then(function (res) {
      numberCBRuns++;
      assert.equal(res, 2);
    });

    f(3).then(function (res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    f(4).then(function (res) {
      numberCBRuns++;
      assert.equal(res, 2);
    });

    f(5).then(function (res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    setTimeout(function () {
      assert.equal(numberRuns, 2);
      assert.equal(numberCBRuns, 5);
      done();
    }, 60);

  });
});
