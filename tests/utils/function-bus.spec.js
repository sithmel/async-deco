var assert = require('chai').assert;
var FunctionBus = require('../../utils/function-bus');

describe('function bus', function () {
  it('is a factory function', function () {
    assert.typeOf(FunctionBus, 'function');
    assert.typeOf(new FunctionBus(), 'object');
  });

  it('pub sub', function (done) {
    var bus = new FunctionBus();
    var result = '';
    bus.queue('a', function (obj) {
      result += obj;
    });
    bus.queue('a', function (obj) {
      result += obj;
    });
    bus.queue('b', function (obj) {
      result += obj;
    });
    assert.equal(bus._length('a'), 2);
    assert.equal(bus._length('b'), 1);
    bus.execute('a', ['test']);
    setTimeout(function () {
      assert.equal(result, 'testtest');
      assert.equal(bus._length('a'), 0);
      assert.equal(bus._length('b'), 1);
      done();
    }, 10);
  });

  it('pub sub (pause)', function (done) {
    var bus = new FunctionBus();
    var result = '';
    bus.queue('a', function (obj) {
      result += obj;
    });
    bus.queue('a', function (obj) {
      result += obj;
    });
    bus.queue('b', function (obj) {
      result += obj;
    });
    assert.equal(bus._length('a'), 2);
    assert.equal(bus._length('b'), 1);
    bus.pause();
    bus.execute('a', ['test']);
    bus.resume();
    setTimeout(function () {
      assert.equal(result, 'testtest');
      assert.equal(bus._length('a'), 0);
      assert.equal(bus._length('b'), 1);
      done();
    }, 10);
  });

});
