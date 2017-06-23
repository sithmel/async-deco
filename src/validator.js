var defaultLogger = require('../utils/default-logger');
var match = require('occamsrazor-match');
var and = require('occamsrazor-match/extra/and');

function validatorDecorator(wrapper, args) {
  var validators = match(args);
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var argsToValidate = Array.prototype.slice.call(arguments, 0, args.length - 1);
      if (validators(argsToValidate)) {
        func.apply(context, args);
      } else {
        logger('validation-error', {
          validator: validators.name,
          args: args
        });
        cb(new Error('Function called with wrong arguments: ' + validators.name));
      }
    };
  });
}

module.exports = validatorDecorator;
