require('setimmediate');

function Lock() {
  this.locked = {};
  this.queues = {};
  this.timers = {};
}

Lock.prototype.lock = function (resource, ttl, callback) {
  callback = callback || function () {};
  var that = this;
  if (resource in this.locked) {
    if (!(resource in this.queues)) {
      this.queues[resource] = [];
    }
    this.queues[resource].push({ callback: callback, ttl: ttl });
  } else {
    this.locked[resource] = true;
    this.timers[resource] = setTimeout(function () {
      that.unlock(resource, function () {});
    }, ttl);

    callback(null, { unlock: function (cb) {
      that.unlock(resource, cb);
    }});
  }
};

Lock.prototype.unlock = function (resource, callback) {
  callback = callback || function () {};
  delete this.locked[resource];
  clearTimeout(this.timers[resource]);
  delete this.timers[resource];

  var that = this;
  var item = (this.queues[resource] || []).shift();
  if (item) {
    setImmediate(function () {
      that.lock(resource, item.ttl, item.callback, callback);
    });
  } else {
    delete this.queues[resource];
    callback(null);
  }
};

module.exports = Lock;
