var assert = require('chai').assert;
var TaskQueue = require('../../utils/task-queue');
var queueFactory = TaskQueue.queueFactory;
var TaskQueueOverflowError = TaskQueue.TaskQueueOverflowError;

describe('task queue', function () {
  it('must work without priorities', function () {
    var q = queueFactory();
    var sequence = [];
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['A']);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['B']);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['C']);
    assert.equal(q.size(), 3);
    q.shift()();
    assert.equal(q.size(), 2);
    q.shift()();
    assert.equal(q.size(), 1);
    q.shift()();
    assert.equal(q.size(), 0);
    assert.equal('ABC', sequence.join(''));
  });

  it('must work with priorities', function () {
    var q = queueFactory(function (letter, priority) {
      return priority;
    });

    var sequence = [];

    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['A', 0]);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['B', 1]);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['C', 2]);

    assert.equal(q.size(), 3);
    q.shift()();
    assert.equal(q.size(), 2);
    q.shift()();
    assert.equal(q.size(), 1);
    q.shift()();
    assert.equal(q.size(), 0);
    assert.equal('ABC', sequence.join(''));
  });

  it('must work with priorities (2)', function () {
    var q = queueFactory(function (letter, priority) {
      return priority;
    });

    var sequence = [];

    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['A', 10]);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['B', 4]);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['C', 5]);

    q.shift()();
    q.shift()();
    q.shift()();
    assert.equal('BCA', sequence.join(''));
  });

  it('must work with a max queueSize', function () {
    var q = queueFactory(undefined, 1);
    var sequence = [];
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['A']);

    assert.throws(function () {
      q.push(function (letter) {
        sequence.push(letter);
      }, null, ['B']);
    }, TaskQueueOverflowError, 'Queue full');

    assert.equal(q.size(), 1);

    assert.throws(function () {
      q.push(function (letter) {
        sequence.push(letter);
      }, null, ['C']);
    }, TaskQueueOverflowError, 'Queue full');
    assert.equal(q.size(), 1);

    q.shift()();
    assert.equal(q.size(), 0);

    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['D']);
    q.shift()();
    assert.equal('AD', sequence.join(''));
  });

  it('must work with a max queueSize and priority', function () {
    var q = queueFactory(function (letter, priority) {
      return priority;
    }, 2);

    var sequence = [];

    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['A', 10]);
    q.push(function (letter) {
      sequence.push(letter);
    }, null, ['B', 4]);

    assert.throws(function () {
      q.push(function (letter) {
        sequence.push(letter);
      }, null, ['C', 5]);
    }, TaskQueueOverflowError, 'Queue full');
    assert.equal(q.size(), 2);

    q.shift()();
    q.shift()();
    assert.equal('BC', sequence.join(''));
  });
});
