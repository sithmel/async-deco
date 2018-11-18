export default class FunctionBus {
  constructor () {
    this.callback_queues = new Map()
    this.onExec = () => {}
  }

  queue (key, resolve, reject) {
    if (this.callback_queues.has(key)) {
      this.callback_queues.get(key).push({ resolve, reject })
    } else {
      this.callback_queues.set(key, [{ resolve, reject }])
    }
  }

  onExecute (func) {
    this.onExec = func
  }

  len (key) {
    return this._getFunc(key).length
  }

  _getFunc (key) {
    return this.callback_queues.has(key) ? this.callback_queues.get(key) : []
  }

  _removeFunc (key) {
    this.callback_queues.delete(key)
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
