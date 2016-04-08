var defaultLogger = require('../utils/default-logger');

function fallbackDecorator(wrapper, fallbackFunction, error) {
  var condition;
  error = error || Error;
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
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          logger('fallback', {actualResult: {err: err, res: dep}});
          fallbackFunction.apply(context, args.slice(0, -1).concat(cb));
        }
        else {
          cb(err, dep);
        }
      };

      func.apply(context, args);
    };
  });
}

module.exports = fallbackDecorator;
