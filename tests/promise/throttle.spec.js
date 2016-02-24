var assert = require('chai').assert;
var throttleDecorator = require('../../promise/throttle');

describe('throttle (promise)', function () {
  var throttle, debounceKey;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function () {
      return function (type, obj) {
        log.push({type: type, obj: obj});
      };
    };

    throttle = throttleDecorator(50, undefined, undefined, undefined, logger);
    debounce = throttleDecorator(50, 'debounce', undefined, undefined, logger);
    debounceKey = throttleDecorator(50, 'debounce', undefined, function (n) { return n % 2 === 0 ? 'even' : 'odd'; }, logger);
  });

  it('must throttle function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = throttle(function (a, next) {
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

    setTimeout(function () {
      assert.equal(numberRuns, 2);
      assert.equal(numberCBRuns, 3);
      done();
    }, 60);

  });

  it('must debounce function calls', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = debounce(function (a, next) {
      numberRuns++;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a);
        }, 0);
      });
    });

    f('a').then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('b').then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    f('c').then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 'a');
    });

    setTimeout(function () {
      assert.equal(numberRuns, 1);
      assert.equal(numberCBRuns, 3);
      done();
    }, 60);

  });

  it('must debounce a function using a key', function (done) {
    var numberRuns = 0;
    var numberCBRuns = 0;

    var f = debounceKey(function (a, next) {
      numberRuns++;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(a);
        }, 0);
      });
    });

    f(1).then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    f(2).then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 2);
    });

    f(3).then(function (err, res) {
      numberCBRuns++;
      assert.equal(res, 1);
    });

    setTimeout(function () {
      assert.equal(numberRuns, 2);
      assert.equal(numberCBRuns, 3);
      done();
    }, 60);

  });
});
