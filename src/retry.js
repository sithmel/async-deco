var noopLogger = require('./noop-logger');

function retryDecorator(wrapper, times, interval, error, getlogger) {
  var condition;
  times = times || Infinity;
  error = error || Error;
  interval = interval || 0;
  var intervalFunc = typeof interval === 'function' ?
    interval :
    function () { return interval; };

  getlogger = getlogger || noopLogger;
  if (error === Error || Error.isPrototypeOf(error)) {
    condition = function (err, dep) { return err instanceof error; };
  }
  else {
    condition = error;
  }

  return wrapper(function (func) {
    return function () {
      var counter = 0;
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = getlogger.apply(context, args);
      var cb = args[args.length - 1];

      var retry = function () {
        if (intervalFunc(counter++) > 0) {
          setTimeout(function () {
            func.apply(context, args);
          }, interval);
        }
        else {
          func.apply(context, args);
        }
      };

      args[args.length - 1] = function (err, dep) {
        if (condition(err, dep) && counter < times) {
          logger('retry', {
            times: counter
          });
          retry();
        }
        else {
          cb(err, dep);
        }
      };
      retry();
    };
  });
}

module.exports = retryDecorator;
