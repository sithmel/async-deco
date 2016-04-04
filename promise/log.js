var _log = require('../src/log');
var wrapper = require('../src/promise-translator');

function log(logger, name) {
  return _log(wrapper, logger, name);
}

module.exports = log;
