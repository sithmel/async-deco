var _limit = require('../src/limit');
var wrapper = require('../src/noop');

function limit(max, logger) {
  return _limit(wrapper, max, logger);
}

module.exports = limit;
