var path = require('path')
var utils = require('require-all')(path.join(__dirname, 'utils'))
var callback = require('require-all')(path.join(__dirname, 'callback'))
var promise = require('require-all')(path.join(__dirname, 'promise'))

module.exports = {
  utils: utils,
  callback: callback,
  promise: promise
}
