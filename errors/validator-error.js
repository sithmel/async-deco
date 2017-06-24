function ValidatorError(message, errors) {
  this.name = 'ValidatorError';
  this.message = message || 'ValidatorError';
  this.errors = errors;
  this.stack = (new Error()).stack;
}

ValidatorError.prototype = Object.create(Error.prototype);
ValidatorError.prototype.constructor = ValidatorError;

module.exports = ValidatorError;
