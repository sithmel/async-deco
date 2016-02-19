var _log = require('../src/log');
var wrapper = require('../src/noop');

function log(logger) {
  return _log(wrapper, logger);
}

module.exports = log;
