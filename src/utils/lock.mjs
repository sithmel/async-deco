export default class Lock {
  constructor () {
    this.locked = new Map()
    this.queues = new Map()
    this.timers = new Map()
  }

  lock (resource, ttl, callback = () => {}) {
    if (this.locked.has(resource)) {
      if (!this.queues.has(resource)) {
        this.queues.set(resource, [])
      }
      this.queues.get(resource).push({ callback, ttl })
    } else {
      this.locked.set(resource, true)
      this.timers.set(resource, setTimeout(() => this.unlock(resource, () => {}), ttl))

      callback(null, { unlock: (cb) => this.unlock(resource, cb) })
    }
  }

  unlock (resource, callback = () => {}) {
    this.locked.delete(resource)
    clearTimeout(this.timers.get(resource))
    this.timers.delete(resource)

    const item = (this.queues.get(resource) || []).shift()
    if (item) {
      Promise.resolve()
        .then(() => this.lock(resource, item.ttl, item.callback, callback))
    } else {
      this.queues.delete(resource)
      callback(null)
    }
  }
}
