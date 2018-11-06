export default class Lock {
  constructor () {
    this.locked = {}
    this.queues = {}
    this.timers = {}
  }

  lock (resource, ttl, callback = () => {}) {
    if (resource in this.locked) {
      if (!(resource in this.queues)) {
        this.queues[resource] = []
      }
      this.queues[resource].push({ callback, ttl })
    } else {
      this.locked[resource] = true
      this.timers[resource] = setTimeout(() => this.unlock(resource, () => {}), ttl)

      callback(null, { unlock: (cb) => this.unlock(resource, cb) })
    }
  }

  unlock (resource, callback = () => {}) {
    delete this.locked[resource]
    clearTimeout(this.timers[resource])
    delete this.timers[resource]

    const item = (this.queues[resource] || []).shift()
    if (item) {
      Promise.resolve()
        .then(() => this.lock(resource, item.ttl, item.callback, callback))
    } else {
      delete this.queues[resource]
      callback(null)
    }
  }
}
