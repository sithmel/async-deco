/* eslint-env node, mocha */
import { assert } from 'chai'
import limitDecorator from '../src/limit'

function timePassedFrom () {
  const t0 = Date.now()
  return function (ms) {
    const t1 = Date.now()
    const delta = t1 - t0
    assert(delta < ms + 5, 'It took more than ' + ms + ' ms')
    assert(delta > ms - 5, 'It took less than ' + ms + ' ms')
  }
}

describe('limit', () => {
  let limitToOne, limitToTwo, limitToThree

  beforeEach(() => {
    limitToOne = limitDecorator({ concurrency: 1 })
    limitToTwo = limitDecorator({ concurrency: 2 })
    limitToThree = limitDecorator({ concurrency: 3 })
  })

  it('must limit to one function call', (done) => {
    const assertTimePassed = timePassedFrom()

    const f = limitToOne((a) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(a)
        }, a)
      })
    })

    let c = 0
    const getResult = (dep) => {
      c++
      if (c === 1) {
        assertTimePassed(40)
        assert.equal(dep, 40)
      } else if (c === 2) {
        assertTimePassed(60)
        assert.equal(dep, 20)
      } else if (c === 3) {
        assertTimePassed(120)
        assert.equal(dep, 60)
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })

  it('must limit to 2 function call', (done) => {
    const assertTimePassed = timePassedFrom()

    const f = limitToTwo(function (a) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(a)
        }, a)
      })
    })

    let c = 0
    const getResult = function (dep) {
      c++
      if (c === 1) {
        assertTimePassed(20)
        assert.equal(dep, 20)
      } else if (c === 2) {
        assertTimePassed(40)
        assert.equal(dep, 40)
      } else if (c === 3) {
        assertTimePassed(80)
        assert.equal(dep, 60)
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })

  it('must limit to 3 function call', (done) => {
    const assertTimePassed = timePassedFrom()

    const f = limitToThree((a) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(a)
        }, a)
      })
    })

    let c = 0
    const getResult = (dep) => {
      c++
      if (c === 1) {
        assertTimePassed(20)
        assert.equal(dep, 20)
      } else if (c === 2) {
        assertTimePassed(40)
        assert.equal(dep, 40)
      } else if (c === 3) {
        assertTimePassed(60)
        assert.equal(dep, 60)
        done()
      }
    }

    f(40).then(getResult)
    f(20).then(getResult)
    f(60).then(getResult)
  })

  it('changes the name of the function', () => {
    const func = limitToOne(function myfunc () {})
    assert.equal(func.name, 'limit(myfunc)')
  })
})
