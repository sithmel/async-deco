var Heap = require('little-ds-toolkit/lib/heap');
var MinMaxHeap = require('little-ds-toolkit/lib/min-max-heap');

function minPriorityComparator(a, b) {
  return a.priority - b.priority;
}

function getFunction(item) {
  if (!item) return;
  return function () {
    item.func.apply(item.context, item.args);
  };
}

function TaskQueueOverflowError(message, item) {
  this.name = 'TaskQueueOverflowError';
  this.message = message || 'TaskQueueOverflowError';
  this.stack = (new Error()).stack;
  this.item = item;
}

TaskQueueOverflowError.prototype = Object.create(Error.prototype);
TaskQueueOverflowError.prototype.constructor = TaskQueueOverflowError;


function Queue(queueSize) {
  this.data = [];
  this.queueSize = queueSize;
}

Queue.prototype.push = function (func, context, args, cb) {
  var item = {
    func: func,
    context: context,
    args: args,
    cb: cb
  };

  if (typeof this.queueSize !== 'undefined' && this.data.length === this.queueSize) {
    throw new TaskQueueOverflowError('Queue full', item);
  }
  this.data.push(item);
};

Queue.prototype.shift = function () {
  var item = this.data.shift();
  return getFunction(item);
};

Queue.prototype.size = function () {
  return this.data.length;
};

function PriorityQueue(getPriority) {
  this.getPriority = getPriority;
  this.heap = new Heap(minPriorityComparator);
}

PriorityQueue.prototype.push = function (func, context, args, cb) {
  var item = {
    func: func,
    context: context,
    args: args,
    cb: cb
  };
  item.priority = this.getPriority.apply(item.context, item.args);
  this.heap.push(item);
};

PriorityQueue.prototype.shift = function () {
  var item = this.heap.pop();
  return getFunction(item);
};

PriorityQueue.prototype.size = function () {
  return this.heap.size();
};

function MinMaxPriorityQueue(getPriority, queueSize) {
  this.getPriority = getPriority;
  this.heap = new MinMaxHeap(minPriorityComparator);
  this.queueSize = queueSize;
}

MinMaxPriorityQueue.prototype.push = function (func, context, args, cb) {
  var last;
  var item = {
    func: func,
    context: context,
    args: args,
    cb: cb
  };
  item.priority = this.getPriority.apply(item.context, item.args);
  this.heap.push(item);

  if (this.heap.size() > this.queueSize) {
    last = this.heap.popMax();
    throw new TaskQueueOverflowError('Queue full', last);
  }
};

MinMaxPriorityQueue.prototype.shift = function () {
  var item = this.heap.popMin();
  return getFunction(item);
};

MinMaxPriorityQueue.prototype.size = function () {
  return this.heap.size();
};

function queueFactory(getPriority, queueSize) {
  if (!getPriority) {
    return new Queue(queueSize);
  }
  if (typeof queueSize === 'number' && queueSize !== Infinity) {
    return new MinMaxPriorityQueue(getPriority, queueSize);
  }
  return new PriorityQueue(getPriority);
}

module.exports = {
  MinMaxPriorityQueue: MinMaxPriorityQueue,
  PriorityQueue: PriorityQueue,
  Queue: Queue,
  TaskQueueOverflowError: TaskQueueOverflowError,
  queueFactory: queueFactory
};
