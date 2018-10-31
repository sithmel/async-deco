var defaultLogger = require('../utils/default-logger')
var ValidatorError = require('occamsrazor-match/validate-error')
var match = require('occamsrazor-match')
var validationErrors = require('occamsrazor-match/extra/validationErrors')
var funcRenamer = require('../utils/func-renamer')

function getValidatorDecorator (...argsValidators) {
  var validators = match(argsValidators)
  return function validator (func) {
    const renamer = funcRenamer(`validator(${func.name || 'anonymous'})`)
    return renamer(function _validator (...args) {
      var context = this
      var logger = defaultLogger.apply(context)
      var errors = validationErrors()
      if (validators(args, errors)) {
        return func.apply(context, args)
      }
      logger('validation-error', {
        validator: validators.name,
        args,
        errors: errors()
      })
      return Promise.reject(new ValidatorError('Function called with wrong arguments: ' + validators.name, errors()))
    })
  }
}

module.exports = getValidatorDecorator
