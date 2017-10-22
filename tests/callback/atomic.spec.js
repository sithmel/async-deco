var assert = require('chai').assert;
var atomicDecorator = require('../../callback/atomic');
var redis = require('redis');
var Redlock = require('redlock');

describe('atomic (callback)', function () {
  var limitToOne;

  beforeEach(function () {
    limitToOne = atomicDecorator();
  });

  it('must limit to one function call', function (done) {
    var numberRunning = 0;
    var f0 = function (a, next) {
      numberRunning++;
      setTimeout(function () {
        numberRunning--;
        next(undefined, a);
      }, a);
    };

    var f = limitToOne(f0);

    var c = 0;
    var getResult = function (err, dep) {
      assert.equal(numberRunning, 0);
      c++;
      if (c === 3) {
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });
});

describe('atomic using redis (callback)', function () {
  var limitToOne;

  beforeEach(function (done) {
    var client = redis.createClient();
    var redlock = new Redlock([client]);
    limitToOne = atomicDecorator({ lock: redlock, ttl: 1000 });
    client.flushdb(done);
  });

  it('must limit to one function call', function (done) {
    var numberRunning = 0;
    var f0 = function (a, next) {
      numberRunning++;
      setTimeout(function () {
        numberRunning--;
        next(undefined, a);
      }, a);
    };

    var f = limitToOne(f0);

    var c = 0;
    var getResult = function (err, dep) {
      assert.equal(numberRunning, 0);
      c++;
      if (c === 3) {
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });
});
