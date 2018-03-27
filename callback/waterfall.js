var _waterfall = require('../src/waterfall')
var wrapper = require('../src/callback-translator')

module.exports = wrapper(_waterfall)
