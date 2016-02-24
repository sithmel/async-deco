var _limit = require('../src/limit');
var wrapper = require('../src/promise-translator');

function limit(max, getKey, logger) {
  return _limit(wrapper, max, getKey, logger);
}

module.exports = limit;
