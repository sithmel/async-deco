var noopLogger = require('./noop-logger');

function fallbackValueDecorator(wrapper, fallbackValue, error, getlogger) {
  var condition;
  error = error || Error;
  getlogger = getlogger || noopLogger;
  if (error === Error || Error.isPrototypeOf(error)) {
    condition = function (err, dep) { return err instanceof error; };
  }
  else {
    condition = error;
  }
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = getlogger.apply(context, args);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          logger('fallback', {actualResult: {err: err, res: dep}});
          cb(undefined, fallbackValue);
        }
        else {
          cb(err, dep);
        }
      };

      func.apply(context, args);
    };
  });
}

module.exports = fallbackValueDecorator;
