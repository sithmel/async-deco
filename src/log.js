var defaultLogger = require('../utils/default-logger');

function logDecorator(wrapper, prefix) {
  prefix = prefix || '';
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (err) {
          logger(prefix + 'log-error', {
            err: err
          });
        }
        else {
          logger(prefix + 'log-end', {
            result: dep
          });
        }
        cb(err, dep);
      };
      logger(prefix + 'log-start', {args: args.slice(0, -1), context: context});
      func.apply(context, args);
    };
  });
}

module.exports = logDecorator;
