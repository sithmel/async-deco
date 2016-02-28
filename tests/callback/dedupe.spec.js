var assert = require('chai').assert;
var dedupeDecorator = require('../../callback/dedupe');

describe('dedupe (callback)', function () {
  var dedupe, dedupeKey;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    dedupe = dedupeDecorator(undefined, logger);
    dedupeKey = dedupeDecorator(function (n) { return n % 2 === 0 ? 'even' : 'odd'; }, logger);
  });

  it('must dedupe function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = dedupe(function (a, next) {
      numberRuns++;
      setTimeout(function () {
        next(undefined, a);
      }, 0);
    });

    f('a', function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('b', function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('c', function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('d', function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('e', function (err, res) {
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

    var f = dedupeKey(function (a, next) {
      numberRuns++;
      setTimeout(function () {
        next(undefined, a);
      }, 0);
    });

    f(1, function (err, res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    f(2, function (err, res) {
      numberCBRuns++;
      assert.equal(res, 2);
    });

    f(3, function (err, res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    f(4, function (err, res) {
      numberCBRuns++;
      assert.equal(res, 2);
    });

    f(5, function (err, res) {
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
