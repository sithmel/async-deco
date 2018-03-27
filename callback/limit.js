var _limit = require('../src/limit')
var wrapper = require('../src/callback-translator')

function limit (max, getKey, getPriority) {
  return _limit(wrapper, max, getKey, getPriority)
}

module.exports = limit
