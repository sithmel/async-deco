var _proxy = require('../src/proxy');
var wrapper = require('../src/promise-translator');

function proxy(guard) {
  return _proxy(wrapper, guard);
}

module.exports = proxy;
