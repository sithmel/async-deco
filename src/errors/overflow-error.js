function OverflowError (message) {
  this.name = 'OverflowError'
  this.message = message || 'OverflowError'
  this.stack = (new Error()).stack
}

OverflowError.prototype = Object.create(Error.prototype)
OverflowError.prototype.constructor = OverflowError

export default OverflowError
