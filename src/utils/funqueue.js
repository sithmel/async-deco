import queueFactory from './queues'
import OverflowError from '../errors/overflow-error'

export default class FunQueue {
  constructor (opts = {}) {
    this.queueSize = opts.queueSize || Infinity
    this.concurrency = opts.concurrency || 1
    this.numberRunning = 0
    this.queue = queueFactory(opts.comparator, opts.queueSize)
  }

  _execNext () {
    if (this.queue.size() === 0 || this._pause) return

    const { func, args, resolve, reject } = this.queue.shift()

    this.numberRunning++

    func.apply(null, args)
      .then((res) => {
        this.numberRunning--
        resolve(res)
        this._execNext()
      })
      .catch((err) => {
        this.numberRunning--
        reject(err)
        this._execNext()
      })
  }

  exec (func, args) {
    return new Promise((resolve, reject) => {
      this.queue.push({ func, args, resolve, reject })
      if (this.queue.size() > this.queueSize) {
        const data = this.queue.pop()
        const rejectFunc = data.reject
        return rejectFunc(new OverflowError('Queue full'))
      }
      if (this.numberRunning < this.concurrency) this._execNext()
    })
  }

  pause () {
    this._pause = true
  }

  resume () {
    this._pause = false
    while (this.numberRunning < this.concurrency) {
      this._execNext()
    }
  }
}
