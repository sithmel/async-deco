function LimitError(message) {
  this.name = 'LimitError';
  this.message = message || 'LimitError';
  this.stack = (new Error()).stack;
}

LimitError.prototype = Object.create(Error.prototype);
LimitError.prototype.constructor = LimitError;

module.exports = LimitError;
