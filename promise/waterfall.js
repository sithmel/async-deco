var _waterfall = require('../src/waterfall');
var wrapper = require('../src/promise-translator');

module.exports = wrapper(_waterfall);
