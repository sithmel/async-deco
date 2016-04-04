var _proxy = require('../src/proxy');
var wrapper = require('../src/noop');

function proxy(guard) {
  return _proxy(wrapper, guard);
}

module.exports = proxy;
