var _log = require('../src/log');
var wrapper = require('../src/promise-translator');

function log(prefix) {
  return _log(wrapper, prefix);
}

module.exports = log;
