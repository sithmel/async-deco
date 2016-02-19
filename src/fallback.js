function fallbackDecorator(wrapper, fallbackFunction, error, logger) {
  var condition;
  error = error || Error;
  logger = logger || function () {};
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
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep)) {
          logger('fallback', {});
          fallbackFunction.apply(context, [err].concat(args.slice(0, -1), cb));
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
