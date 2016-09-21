var assert = require('chai').assert;
var addLogger = require('../../utils/add-logger');
var defaultLogger = require('../../utils/default-logger');

describe('addLogger', function () {
  it('attach a logger', function () {
    var logs = [];
    var logger = addLogger(function (evt, obj, ts) {
      logs.push({evt: evt, obj: obj});
    });
    var f = logger(function () {
      var l = defaultLogger.call(this);
      l('test', 'obj');
    });
    f();
    assert.deepEqual(logs, [{ evt:'test', obj: 'obj' }]);
  });

  it('attach a logger to object', function () {
    var logs = [];
    var logger = addLogger(function (evt, obj, ts) {
      logs.push({evt: evt, obj: obj});
    });
    var context = { test: 1 };
    var f = (function () {
      var l = defaultLogger.call(this);
      assert.equal(this.test, 1);
      l('test', 'obj');
    });
    var decoratedf = logger(f).bind(context);
    decoratedf();
    assert.deepEqual(logs, [{ evt:'test', obj: 'obj' }]);
  });

  it('attach 2 loggers', function () {
    var logs1 = [];
    var logs2 = [];
    var logger1 = addLogger(function (evt, obj, ts) {
      logs1.push({evt: evt, obj: obj});
    });
    var logger2 = addLogger(function (evt, obj, ts) {
      logs2.push({evt: evt, obj: obj});
    });
    var f = logger2(logger1(function () {
      var l = defaultLogger.call(this);
      l('test', 'obj');
    }));
    f();
    assert.deepEqual(logs1, [{ evt:'test', obj: 'obj' }]);
    assert.deepEqual(logs2, [{ evt:'test', obj: 'obj' }]);
  });
});
