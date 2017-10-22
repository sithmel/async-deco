require('setimmediate');

function FunctionBus() {
  this.callback_queues = {};
  this.onExec = function () {};
}

FunctionBus.prototype.queue = function queue(key, cb) {
  if (this.callback_queues[key]) {
    this.callback_queues[key].push(cb);
  } else {
    this.callback_queues[key] = [cb];
  }
};

FunctionBus.prototype.onExecute = function onExecute(func) {
  this.onExec = func;
};

FunctionBus.prototype.len = function len(key) {
  return key in this.callback_queues ? this.callback_queues[key].length : 0;
};

FunctionBus.prototype.execute = function execute(key, args) {
  var len = this.len(key);

  if (!len) return;

  this.onExec(key, len);

  for (var i = 0; i < len; i++) {
    setImmediate((function (f) {
      return function () {
        f.apply(this, args);
      };
    })(this.callback_queues[key][i]));
  }
  delete this.callback_queues[key];
};

module.exports = FunctionBus;
