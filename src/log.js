var buildLogger = require('../utils/build-logger');
var defaultLogger = require('../utils/default-logger');
var uuid = require('uuid');

function logDecorator(wrapper, log, name) {
  return wrapper(function (func) {
    name = name || func.name;
    return function () {
      var context, id;
      if (log) {
        id = uuid.v4();
        context = buildLogger(this, name, id, log);
      } else {
        context = this;
      }
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
