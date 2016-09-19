var _log = require('../src/log');
var wrapper = require('../src/promise-translator');

function log() {
  return _log(wrapper);
}

module.exports = log;
