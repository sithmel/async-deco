var match = require('occamsrazor-match');
var and = require('occamsrazor-match/extra/and');

function validatorDecorator() {
  var args = Array.prototype.slice.call(arguments, 0);
  var validators = match(args);
  return function (func) {
    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var argsToValidate = Array.prototype.slice.call(arguments, 0, args.length);
      if (validators(argsToValidate)) {
        return func.apply(context, args);
      } else {
        throw new Error('Function called with wrong arguments: ' + validators.name);
      }
    };
  };
}

module.exports = validatorDecorator;
