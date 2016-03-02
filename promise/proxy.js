var _proxy = require('../src/proxy');
var wrapper = require('../src/promise-translator');

function proxy(guard, logger) {
  return _proxy(wrapper, guard, logger);
}

module.exports = proxy;
