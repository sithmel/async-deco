/* eslint-env node, mocha */
var assert = require('chai').assert
var funcRenamer = require('../../utils/func-renamer')

describe('funcRenamer', function () {
  it('is a function', function () {
    assert.typeOf(funcRenamer, 'function')
  })

  it('can rename a function', function () {
    var rename = funcRenamer('hello')
    var original = function ciao () {}
    var f = rename(original)
    assert.equal(f.name, 'hello')
    assert.equal(original, f)
  })
})
