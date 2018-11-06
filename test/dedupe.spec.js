/* eslint-env node, mocha */
import { assert } from 'chai'
import dedupeDecorator from '../src/dedupe'

describe('dedupe', () => {
  let dedupe, dedupeKey

  beforeEach(() => {
    dedupe = dedupeDecorator()
    dedupeKey = dedupeDecorator({ getKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
  })

  it('must dedupe function calls', (done) => {
    let numberRuns = 0
    let numberCBRuns = 0

    const f = dedupe((a) => {
      numberRuns++
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(a)
        }, 0)
      })
    })

    f('a').then((res) => {
      numberCBRuns++
      assert.equal(res, 'a')
    })

    f('b').then((res) => {
      numberCBRuns++
      assert.equal(res, 'a')
    })

    f('c').then((res) => {
      numberCBRuns++
      assert.equal(res, 'a')
    })

    f('d').then((res) => {
      numberCBRuns++
      assert.equal(res, 'a')
    })

    f('e').then((res) => {
      numberCBRuns++
      assert.equal(res, 'a')
    })

    setTimeout(() => {
      assert.equal(numberRuns, 1)
      assert.equal(numberCBRuns, 5)
      done()
    }, 60)
  })

  it('must dedupe a function using a key', (done) => {
    let numberRuns = 0
    let numberCBRuns = 0

    const f = dedupeKey((a) => {
      numberRuns++
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(a)
        }, 0)
      })
    })

    f(1).then((res) => {
      numberCBRuns++
      assert.equal(res, 1)
    })

    f(2).then((res) => {
      numberCBRuns++
      assert.equal(res, 2)
    })

    f(3).then((res) => {
      numberCBRuns++
      assert.equal(res, 1)
    })

    f(4).then((res) => {
      numberCBRuns++
      assert.equal(res, 2)
    })

    f(5).then((res) => {
      numberCBRuns++
      assert.equal(res, 1)
    })

    setTimeout(() => {
      assert.equal(numberRuns, 2)
      assert.equal(numberCBRuns, 5)
      done()
    }, 60)
  })

  it('changes the name of the function', () => {
    const func = dedupe(function func () {})
    assert.equal(func.name, 'dedupe(func)')
  })
})
