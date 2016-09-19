var defaultLogger = require('../utils/default-logger');
var uuid = require('uuid');

function logDecorator(wrapper) {
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (err) {
          logger('log-error', {
            err: err
          });
        }
        else {
          logger('log-end', {
            result: dep
          });
        }
        cb(err, dep);
      };
      logger('log-start', {args: args.slice(0, -1), context: context});
      func.apply(context, args);
    };
  });
}

module.exports = logDecorator;
