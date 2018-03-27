/* eslint-env node, mocha */
var assert = require('chai').assert
var funcRenamer = require('../../utils/func-renamer')

describe('funcRenamer', function () {
  it('is a function', function () {
    assert.typeOf(funcRenamer, 'function')
  })

  it('can rename a function', function () {
    var rename = funcRenamer('hello')
    var f = rename(function ciao () {})
    assert.equal(f.name, 'hello')
  })

  it('can decorate the name of a function', function () {
    var rename = funcRenamer('hello', true)
    var f = rename(function ciao () {})
    assert.equal(f.name, 'hello(ciao)')
  })
})
