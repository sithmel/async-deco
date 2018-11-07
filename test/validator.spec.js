/* eslint-env node, mocha */
import { assert } from 'chai'
import validatorDecorator from '../src/validator'
import or from 'occamsrazor-match/extra/or'

describe('validator (promise)', () => {
  it('must pass validation', (done) => {
    const validator = validatorDecorator(1, or([false, true]))

    const func = validator(function (number, bool) {
      return new Promise((resolve, reject) => {
        resolve(number)
      })
    })

    func(1, true).then(function (res) {
      assert.equal(res, 1)
      done()
    })
  })

  it('must pass validation (with extra arg)', (done) => {
    const validator = validatorDecorator(1, or([false, true]))

    const func = validator(function (number, bool, extra) {
      return new Promise((resolve, reject) => {
        resolve(number)
      })
    })

    func(1, true, 'extra').then(function (res) {
      assert.equal(res, 1)
      done()
    })
  })

  it('must not pass validation', (done) => {
    const validator = validatorDecorator(2, or([false, true]))

    const func = validator(function (number, bool) {
      return new Promise((resolve, reject) => {
        resolve(number)
      })
    })

    func(1, true).catch(function (err) {
      assert.equal(err.message, 'Function called with wrong arguments: array:[isNumber:2,or(isFalse isTrue)]')
      done()
    })
  })
})
