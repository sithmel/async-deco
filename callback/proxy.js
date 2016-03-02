var _proxy = require('../src/proxy');
var wrapper = require('../src/noop');

function proxy(guard, logger) {
  return _proxy(wrapper, guard, logger);
}

module.exports = proxy;
