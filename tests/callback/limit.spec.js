var assert = require('chai').assert;
var limitDecorator = require('../../callback/limit');
var LimitError = require('../../errors/limit-error');

function timePassedFrom() {
  var t0 = Date.now();
  return function (ms) {
    var t1 = Date.now();
    var delta = t1 - t0;
    assert(delta < ms + 5, 'It took more than ' + ms + ' ms');
    assert(delta > ms - 5, 'It took less than ' + ms + ' ms');
  };
}

describe('limit (callback)', function () {
  var limitToOne, limitToTwo, limitToThree;

  beforeEach(function () {
    limitToOne = limitDecorator(1);
    limitToTwo = limitDecorator(2);
    limitToThree = limitDecorator(3);
  });

  it('must limit to one function call', function (done) {
    var assertTimePassed = timePassedFrom();

    var f = limitToOne(function (a, next) {
      setTimeout(function () {
        next(undefined, a);
      }, a);
    });

    var c = 0;
    var getResult = function (err, dep) {
      c++;
      if (c === 1) {
        assertTimePassed(40);
        assert.equal(dep, 40);
      } else if (c == 2) {
        assertTimePassed(60);
        assert.equal(dep, 20);
      } else if (c == 3) {
        assertTimePassed(120);
        assert.equal(dep, 60);
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });

  it('must limit to 2 function call', function (done) {
    var assertTimePassed = timePassedFrom();

    var f = limitToTwo(function (a, next) {
      setTimeout(function () {
        next(undefined, a);
      }, a);
    });

    var c = 0;
    var getResult = function (err, dep) {
      c++;
      if (c === 1) {
        assertTimePassed(20);
        assert.equal(dep, 20);
      } else if (c == 2) {
        assertTimePassed(40);
        assert.equal(dep, 40);
      } else if (c == 3) {
        assertTimePassed(80);
        assert.equal(dep, 60);
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });

  it('must limit to 3 function call', function (done) {
    var assertTimePassed = timePassedFrom();

    var f = limitToThree(function (a, next) {
      setTimeout(function () {
        next(undefined, a);
      }, a);
    });

    var c = 0;
    var getResult = function (err, dep) {
      c++;
      if (c === 1) {
        assertTimePassed(20);
        assert.equal(dep, 20);
      } else if (c == 2) {
        assertTimePassed(40);
        assert.equal(dep, 40);
      } else if (c == 3) {
        assertTimePassed(60);
        assert.equal(dep, 60);
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });
});

describe('hard limit (callback)', function () {
  var limitToOne, limitToTwo, limitToThree;

  beforeEach(function () {
    limitToOne = limitDecorator({limit: 1, queueSize: 0});
    limitToTwo = limitDecorator({limit: 1, queueSize: 1});
  });

  it('must limit to one function call', function (done) {
    var assertTimePassed = timePassedFrom();

    var f = limitToOne(function (a, next) {
      setTimeout(function () {
        next(undefined, a);
      }, a);
    });

    var c = 0;
    var getResult = function (err, dep) {
      c++;
      if (c === 1) { // the second function returns an error immediately
        assert.instanceOf(err, LimitError);
        assert.isUndefined(dep);
      } else if (c === 2) { // the first function returns the result
        assertTimePassed(40);
        assert.equal(dep, 40);
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
  });

  it('must limit to 2 function call', function (done) {
    var assertTimePassed = timePassedFrom();

    var f = limitToTwo(function (a, next) {
      setTimeout(function () {
        next(undefined, a);
      }, a);
    });

    var c = 0;
    var getResult = function (err, dep) {
      c++;
      if (c === 1) { // the thirs function returns an error immediately
        assert.instanceOf(err, LimitError);
        assert.isUndefined(dep);
      } else if (c == 2) {
        assertTimePassed(40);
        assert.equal(dep, 40);
      } else if (c == 3) {
        assertTimePassed(60);
        assert.equal(dep, 20);
        done();
      }
    };

    f(40, getResult);
    f(20, getResult);
    f(60, getResult);
  });
});
