/* eslint-env node, mocha */
import { assert } from 'chai'
import funcRenamer from '../../src/utils/func-renamer'

describe('funcRenamer', () => {
  it('is a function', () => {
    assert.typeOf(funcRenamer, 'function')
  })

  it('can rename a function', () => {
    const rename = funcRenamer('hello')
    const original = function ciao () {}
    const f = rename(original)
    assert.equal(f.name, 'hello')
    assert.equal(original, f)
  })
})
