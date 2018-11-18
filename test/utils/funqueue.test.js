/* eslint-env node, mocha */
import { assert } from 'chai'
import FunQueue from '../../src/utils/funqueue'
import OverflowError from '../../src/errors/overflow-error'

const echoFunc = (result, timeout) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(result), timeout)
  })

const rejectFunc = (timeout) =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('oh no')), timeout)
  })

describe('task queue', () => {
  describe('FIFO', () => {
    it('queues', async () => {
      const q = new FunQueue()
      let seq = ''
      const p1 = q.exec(echoFunc, ['A', 50]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['C', 10]).then((res) => { seq += res })

      await Promise.all([p1, p2, p3])
      assert.equal(seq, 'ABC')
    })

    it('manages rejections', async () => {
      const q = new FunQueue()

      let seq = ''

      const p1 = q.exec(rejectFunc, [10]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['C', 10]).then((res) => { seq += res })

      try {
        await p1
      } catch (e) {
        assert.equal(e.message, 'oh no')
      }
      await Promise.all([p2, p3])
      assert.equal(seq, 'BC')
    })

    it('works with concurrency more than 1', async () => {
      const q = new FunQueue({ concurrency: 2 })

      let seq = ''

      const p1 = q.exec(echoFunc, ['A', 25]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['C', 10]).then((res) => { seq += res })

      await Promise.all([p1, p2, p3])
      assert.equal(seq, 'BAC')
    })

    it('manages max queue size', async () => {
      const q = new FunQueue({ queueSize: 1 })

      let seq = ''

      const p1 = q.exec(echoFunc, ['A', 25]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['C', 10]).then((res) => { seq += res })
      try {
        await p3
      } catch (e) {
        assert.instanceOf(e, OverflowError)
      }

      await Promise.all([p1, p2])
      assert.equal(seq, 'AB')
    })
  })
  describe('ordered', () => {
    it('queues', async () => {
      const q = new FunQueue({ comparator: (a, b) => a.args[0].localeCompare(b.args[0], 'en') })

      let seq = ''

      const p1 = q.exec(echoFunc, ['C', 50]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['A', 10]).then((res) => { seq += res })
      await Promise.all([p1, p2, p3])

      assert.equal(seq, 'CAB')
    })

    it('manages rejections', async () => {
      const q = new FunQueue({ comparator: (a, b) => a.args[0].localeCompare(b.args[0], 'en') })

      let seq = ''

      const p1 = q.exec(rejectFunc, [10]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['A', 10]).then((res) => { seq += res })

      try {
        await p1
      } catch (e) {
        assert.equal(e.message, 'oh no')
      }
      await Promise.all([p2, p3])
      assert.equal(seq, 'AB')
    })

    it('manages max queue size', async () => {
      const q = new FunQueue({
        comparator: (a, b) => a.args[0].localeCompare(b.args[0], 'en'),
        queueSize: 1
      })

      let seq = ''

      const p1 = q.exec(echoFunc, ['C', 25]).then((res) => { seq += res })
      const p2 = q.exec(echoFunc, ['B', 20]).then((res) => { seq += res })
      const p3 = q.exec(echoFunc, ['A', 10]).then((res) => { seq += res })
      try {
        await p2
      } catch (e) {
        assert.instanceOf(e, OverflowError)
      }

      await Promise.all([p1, p3])
      assert.equal(seq, 'CA')
    })
  })
})
