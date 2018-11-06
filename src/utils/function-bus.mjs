export default class FunctionBus {
  constructor () {
    this.callback_queues = {}
    this.onExec = () => {}
  }

  queue (key, resolve, reject) {
    if (this.callback_queues[key]) {
      this.callback_queues[key].push({ resolve, reject })
    } else {
      this.callback_queues[key] = [{ resolve, reject }]
    }
  }

  onExecute (func) {
    this.onExec = func
  }

  len (key) {
    return this._getFunc(key).length
  }

  _getFunc (key) {
    return key in this.callback_queues ? this.callback_queues[key] : []
  }

  _removeFunc (key) {
    delete this.callback_queues[key]
  }

  execute (key, err, res) {
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
}
