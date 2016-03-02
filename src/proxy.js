var noopLogger = require('./noop-logger');

function proxyDecorator(wrapper, guard, getlogger) {
  getlogger = getlogger || noopLogger;
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var guardArgs = Array.prototype.slice.call(arguments, 0);
      var logger = getlogger.apply(context, args);
      var cb = args[args.length - 1];

      guardArgs[args.length - 1] = function (err) {
        if (err) {
          logger('access denied', {
            err: err
          });
          cb(err);
        }
        else {
          func.apply(context, args);
        }
      };

      guard.apply(context, guardArgs);
    };
  });
}

module.exports = proxyDecorator;
