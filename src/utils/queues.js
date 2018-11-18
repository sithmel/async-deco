import Heap from 'little-ds-toolkit/lib/heap'
import MinMaxHeap from 'little-ds-toolkit/lib/min-max-heap'
import Dequeue from 'dequeue'

class FIFOQueue {
  constructor () {
    this.queue = new Dequeue()
  }
  push (data) {
    this.queue.push(data)
  }
  shift () {
    return this.queue.shift()
  }
  pop () {
    return this.queue.pop()
  }
  size () {
    return this.queue.length
  }
}

class PriorityQueue {
  constructor (comparator) {
    this.heap = new Heap(comparator)
  }
  push (data) {
    this.heap.push(data)
  }
  shift () {
    return this.heap.pop()
  }
  pop () {
    throw new Error('Not implemented error')
  }
  size () {
    return this.heap.size()
  }
}

class MinMaxPriorityQueue {
  constructor (comparator, queueSize) {
    this.heap = new MinMaxHeap(comparator)
    this.queueSize = queueSize
  }
  push (data) {
    this.heap.push(data)
  }
  shift () {
    return this.heap.popMin()
  }
  pop () {
    return this.heap.popMax()
  }
  size () {
    return this.heap.size()
  }
}

export default function queueFactory (comparator, queueSize) {
  if (!comparator) {
    return new FIFOQueue()
  }
  if (typeof queueSize === 'number' && queueSize !== Infinity) {
    return new MinMaxPriorityQueue(comparator, queueSize)
  }
  return new PriorityQueue(comparator)
}
