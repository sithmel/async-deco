require('setimmediate');

function FunctionBus() {
  this.callback_queues = {};

  this.argsOnHold = {};
  this.isPaused = false;
}

FunctionBus.prototype.queue = function queue(key, cb) {
  if (this.callback_queues[key]) {
    this.callback_queues[key].push(cb);
  } else {
    this.callback_queues[key] = [cb];
  }
};

FunctionBus.prototype.execute = function execute(key, args) {
  if (this.isPaused) {
    this.argsOnHold[key] = args;
    return;
  }

  var len = this._length(key);
  for (var i = 0; i < len; i++) {
    setImmediate((function (f) {
      return function () {
        f.apply(this, args);
      };
    })(this.callback_queues[key][i]));
  }
  delete this.callback_queues[key];
};

FunctionBus.prototype.pause = function pause(key) {
  this.isPaused = true;
};

FunctionBus.prototype.resume = function resume(key) {
  this.isPaused = false;
  for (var key in this.argsOnHold) {
    this.execute(key, this.argsOnHold[key]);
  }
};

FunctionBus.prototype.has = function has(key) {
  return key in this.callback_queues;
};

FunctionBus.prototype._length = function _length(key) {
  return this.callback_queues[key] ? this.callback_queues[key].length : 0;
};

module.exports = FunctionBus;
