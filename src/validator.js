var defaultLogger = require('../utils/default-logger');
var ValidatorError = require('occamsrazor-match/validate-error');
var match = require('occamsrazor-match');
var and = require('occamsrazor-match/extra/and');
var validationErrors = require('occamsrazor-match/extra/validationErrors');

function validatorDecorator(wrapper, args) {
  var validators = match(args);
  return wrapper(function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var argsToValidate = Array.prototype.slice.call(arguments, 0, args.length - 1);
      var errors = validationErrors();
      if (validators(argsToValidate, errors)) {
        func.apply(context, args);
      } else {
        logger('validation-error', {
          validator: validators.name,
          args: args,
          errors: errors()
        });
        cb(new ValidatorError('Function called with wrong arguments: ' + validators.name, errors()));
      }
    };
  });
}

module.exports = validatorDecorator;
