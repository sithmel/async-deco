var buildLogger = require('./build-logger');
var defaultLogger = require('./default-logger');

function logDecorator(wrapper, log, name) {
  return wrapper(function (func) {
    name = name || func.name;
    return function () {
      var context = buildLogger(this, name, log);
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];

      args[args.length - 1] = function (err, dep) {
        if (err) {
          logger('error', {
            err: err
          });
        }
        else {
          logger('end', {
            result: dep
          });
        }
        cb(err, dep);
      };
      logger('start');
      func.apply(context, args);
    };
  });
}

module.exports = logDecorator;
