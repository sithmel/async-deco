var Heap = require('little-ds-toolkit/lib/heap');

function TaskQueue(getPriority) {
  this.getPriority = getPriority;
  this.isArray = !getPriority;
  this.queue = this.isArray ? [] : new Heap(function (a, b) {
    return a.priority - b.priority;
  });
}

TaskQueue.prototype.push = function (func, context, args) {
  var item = {
    func: func,
    context: context,
    args: args
  };
  if (this.isArray) {
    return this.queue.push(item);
  }
  item.priority = this.getPriority.apply(context, args);
  return this.queue.push(item);
};

TaskQueue.prototype.shift = function () {
  var item = this.isArray ? this.queue.shift() : this.queue.pop();
  if (!item) return;
  return function () {
    item.func.apply(item.context, item.args);
  };
};

TaskQueue.prototype.size = function () {
  return this.isArray ? this.queue.length : this.queue.size();
};

module.exports = TaskQueue;
