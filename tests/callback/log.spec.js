var assert = require('chai').assert;
var logDecorator = require('../../callback/log');

describe('log (callback)', function () {
  var wrapped;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function (name, id, ts, type, obj) {
      log.push({type: type, obj: obj});
    };

    wrapped = logDecorator(logger);
  });

  it('must log success', function (done) {
    var f = wrapped(function (a, b, c, next) {
      next(undefined, a + b + c);
    });
    f(1, 2, 3, function (err, dep) {
      assert.equal(dep, 6);
      assert.deepEqual(log, [
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}},
        {type: 'log-end', obj: {result: 6}}
      ]);
      done();
    });
  });

  it('must log error', function (done) {
    var f = wrapped(function (a, b, c, next) {
      next(new Error('error!'));
    });
    f(1, 2, 3, function (err, dep) {
      assert.instanceOf(err, Error);
      assert.deepEqual(log, [
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}},
        {type: 'log-error', obj: {err: new Error('error!')}}
      ]);
      done();
    });
  });
});
