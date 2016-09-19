var _log = require('../src/log');
var wrapper = require('../src/noop');

function log() {
  return _log(wrapper);
}

module.exports = log;
