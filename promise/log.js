var _log = require('../src/log');
var wrapper = require('../src/promise-translator');

function log(logger) {
  return _log(wrapper, logger);
}

module.exports = log;
