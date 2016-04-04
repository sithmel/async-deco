var _log = require('../src/log');
var wrapper = require('../src/noop');

function log(logger, name) {
  return _log(wrapper, logger, name);
}

module.exports = log;
