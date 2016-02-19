function logDecorator(wrapper, logger) {
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
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
