var buildLogger = require('../utils/build-logger');
var defaultLogger = require('../utils/default-logger');

function logDecorator(wrapper, log, name) {
  return wrapper(function (func) {
    name = name || func.name;
    return function () {
      var context, id;
      if (log) {
        id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
        context = buildLogger(this, name, id, log);
      } else {
        context = this;
      }
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
