function FunctionBus () {
  this.callback_queues = {}
  this.onExec = function () {}
}

FunctionBus.prototype.queue = function queue (key, resolve, reject) {
  if (this.callback_queues[key]) {
    this.callback_queues[key].push({ resolve, reject })
  } else {
    this.callback_queues[key] = [{ resolve, reject }]
  }
}

FunctionBus.prototype.onExecute = function onExecute (func) {
  this.onExec = func
}

FunctionBus.prototype.len = function len (key) {
  return this._getFunc(key).length
}

FunctionBus.prototype._getFunc = function _getFunc (key) {
  return key in this.callback_queues ? this.callback_queues[key] : []
}

FunctionBus.prototype._removeFunc = function _removeFunc (key) {
  delete this.callback_queues[key]
}

FunctionBus.prototype.execute = function execute (key, err, res) {
  const funcs = this._getFunc(key)

  if (!funcs.length) return

  this.onExec(key, funcs.length)

  if (err) {
    funcs.forEach(f => Promise.resolve().then(() => f.reject(err)))
  } else {
    funcs.forEach(f => Promise.resolve().then(() => f.resolve(res)))
  }
  this._removeFunc(key)
}

module.exports = FunctionBus
