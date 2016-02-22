require('setimmediate');

function limitDecorator(wrapper, max, logger) {
  var executionNumber = 0;
  var queue = [];
  logger = logger || function () {};

  function runQueue() {
    if (executionNumber >= max) {
      logger('limit', { number: executionNumber });
      return;
    }
    var f = queue.shift();
    if (f) {
      executionNumber++;
      f();
    }
  }

  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var cb = args[args.length - 1];
      args[args.length - 1] = function (err, dep) {
        executionNumber--;
        setImmediate(runQueue);
        cb(err, dep);
      };

      queue.push(function () {
        func.apply(context, args);
      });
      setImmediate(runQueue);
    };
  });
}

module.exports = limitDecorator;
