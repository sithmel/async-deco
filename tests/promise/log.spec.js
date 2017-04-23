var assert = require('chai').assert;
var logDecorator = require('../../promise/log');
var addLogger = require('../../utils/add-logger');

function getLogkey() {
  return 'key';
}

describe('log (promise)', function () {
  var wrapped;
  var addLog;
  var log;

  beforeEach(function () {
    log = [];
    var logger = function (type, obj, ts, key) {
      log.push({type: type, obj: obj, key: key});
    };

    wrapped = logDecorator();
    addLog = addLogger(logger, getLogkey);
  });

  it('must log success', function (done) {
    var f = addLog(wrapped(function (a, b, c) {
      return new Promise(function (resolve, reject) {
        resolve(a + b + c);
      });
    }));

    f(1, 2, 3).then(function (dep) {
      assert.equal(dep, 6);
      assert.deepEqual(log, [
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}, key: 'key'},
        {type: 'log-end', obj: {result: 6}, key: 'key'}
      ]);
      done();
    });
  });

  it('must log error', function (done) {
    var f = addLog(wrapped(function (a, b, c) {
      return new Promises(function (resolve, reject) {
        reject(new Error('error!'));
      });
    }));
    f(1, 2, 3).catch(function (err) {
      assert.instanceOf(err, Error);
      assert.deepEqual(log, [
        {type: 'log-start', obj: {args: [1, 2, 3], context: log[0].obj.context}, key: 'key'},
        {type: 'log-error', obj: {err: new Error('error!')}, key: 'key'}
      ]);
      done();
    });
  });
});
