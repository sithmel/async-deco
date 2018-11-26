/* eslint-env node, mocha */
import objId from '../../src/utils/obj-id'
import { assert } from 'chai'

describe('deps to key', (done) => {
  it('getIdFromValue is a function', () => {
    assert.typeOf(objId.getIdFromValue, 'function')
  })

  it('getIdFromValues is a function', () => {
    assert.typeOf(objId.getIdFromValues, 'function')
  })

  it('getIdFromAttributes is a function', () => {
    assert.typeOf(objId.getIdFromValue, 'function')
  })

  describe('getIdFromValue', () => {
    it('returns consistent values: number', () => {
      assert.equal(objId.getIdFromValue(0), objId.getIdFromValue(0))
      assert.equal(objId.getIdFromValue(1), objId.getIdFromValue(1))
      assert.notEqual(objId.getIdFromValue(1), objId.getIdFromValue(0))
    })

    it('returns consistent values: null/undefined', () => {
      assert.equal(objId.getIdFromValue(null), objId.getIdFromValue(null))
      assert.equal(objId.getIdFromValue(), objId.getIdFromValue())
      assert.notEqual(objId.getIdFromValue(null), objId.getIdFromValue())
    })

    it('returns consistent values: strings', () => {
      assert.equal(objId.getIdFromValue('hello'), objId.getIdFromValue('hello'))
      assert.notEqual(objId.getIdFromValue('world'), objId.getIdFromValue('hello'))
    })

    it('returns consistent values: booleans', () => {
      assert.equal(objId.getIdFromValue(true), objId.getIdFromValue(true))
      assert.notEqual(objId.getIdFromValue(true), objId.getIdFromValue(false))
    })

    it('returns consistent values: symbol', () => {
      assert.throws(() => objId.getIdFromValue(Symbol('hello')), 'Cannot compute id')
    })

    it('returns consistent values: objects', () => {
      const a = {}
      const b = {}
      assert.equal(objId.getIdFromValue(a), objId.getIdFromValue(a))
      assert.notEqual(objId.getIdFromValue(a), objId.getIdFromValue(b))
    })

    it('returns consistent values: functions', () => {
      const a = () => {}
      const b = () => {}
      assert.equal(objId.getIdFromValue(a), objId.getIdFromValue(a))
      assert.notEqual(objId.getIdFromValue(a), objId.getIdFromValue(b))
    })
  })

  describe('getIdFromValues', () => {
    it('returns consistent values', () => {
      assert.equal(objId.getIdFromValues([ 1, 2 ]), objId.getIdFromValues([ 1, 2 ]))
      assert.notEqual(objId.getIdFromValues([ 1, 2 ]), objId.getIdFromValues([ 1, 3 ]))
    })
    it('return nothing for empty object', () => {
      assert.equal(objId.getIdFromValues([]), 'a#')
    })
  })

  describe('getIdFromAttributes', () => {
    it('returns consistent values', () => {
      assert.equal(objId.getIdFromAttributes({ a: 1, b: 2 }), objId.getIdFromAttributes({ a: 1, b: 2 }))
      assert.equal(objId.getIdFromAttributes({ a: 1, b: 2 }), objId.getIdFromAttributes({ b: 2, a: 1 }))
      assert.notEqual(objId.getIdFromAttributes({ a: 1, b: 2 }), objId.getIdFromAttributes({ a: 1, b: 3 }))
    })
    it('return nothing for empty object', () => {
      assert.equal(objId.getIdFromAttributes({}), 'o#')
    })
  })
})
