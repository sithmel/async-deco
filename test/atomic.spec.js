/* eslint-env node, mocha */
import { assert } from 'chai'
import atomicDecorator from '../src/atomic'
import redis from 'redis'
import Redlock from 'redlock'

describe('atomic', () => {
  let limitToOne

  beforeEach(() => {
    limitToOne = atomicDecorator()
  })

  it('changes the name of the function', () => {
    const func = limitToOne(function myfunc () {})
    assert.equal(func.name, 'atomic(myfunc)')
  })

  it.skip('must limit to one function call', (done) => {
    let numberRunning = 0
    const f0 = function (a) {
      numberRunning++
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          numberRunning--
          resolve(a)
        }, a)
      })
    }

    const f = limitToOne(f0)

    let c = 0
    const getResult = (dep) => {
      assert.equal(numberRunning, 0)
      c++
      if (c === 3) {
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })
})

describe.skip('atomic using redis (promise)', () => {
  let limitToOne, client

  beforeEach(() => {
    client = redis.createClient()

    const redlock = new Redlock([client])
    limitToOne = atomicDecorator({ lock: redlock })
  })

  afterEach(() => {
    client.quit()
  })

  it('must limit to one function call', (done) => {
    let numberRunning = 0
    const f0 = function (a) {
      numberRunning++
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          numberRunning--
          resolve(a)
        }, a)
      })
    }

    const f = limitToOne(f0)

    let c = 0
    const getResult = (dep) => {
      assert.equal(numberRunning, 0)
      c++
      if (c === 3) {
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })
})
