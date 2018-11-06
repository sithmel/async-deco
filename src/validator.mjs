import ValidatorError from 'occamsrazor-match/validate-error'
import match from 'occamsrazor-match'
import validationErrors from 'occamsrazor-match/extra/validationErrors'
import funcRenamer from './utils/func-renamer'

export default function getValidatorDecorator (...argsValidators) {
  const validators = match(argsValidators)
  return function validator (func) {
    const renamer = funcRenamer(`validator(${func.name || 'anonymous'})`)
    return renamer(function _validator (...args) {
      const context = this
      const errors = validationErrors()
      if (validators(args, errors)) {
        return func.apply(context, args)
      }
      return Promise.reject(new ValidatorError('Function called with wrong arguments: ' + validators.name, errors()))
    })
  }
}
