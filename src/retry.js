var addLogger = require('./add-logger')
var funcRenamer = require('./utils/func-renamer')

const customSetTimeout = (func, interval) => interval ? setTimeout(func, interval) : func()

function getRetryDecorator (opts = {}) {
  const times = opts.times || Infinity
  const interval = opts.interval || 0
  var intervalFunc = typeof interval === 'function'
    ? interval
    : function () { return interval }

  return function retry (func) {
    const renamer = funcRenamer(`retry(${func.name || 'anonymous'})`)
    return renamer(function _retry (...args) {
      var context = this
      const logger = addLogger.getLogger(context)
      var counter = 0

      return new Promise((resolve, reject) => {
        (function retry () {
          var interval = counter ? intervalFunc(counter) : 0
          counter++
          customSetTimeout(() =>
            func.apply(context, args)
              .then(resolve)
              .catch((err) => {
                if (counter < times) {
                  logger('retry', { times: counter, err })
                  return retry()
                } else {
                  reject(err)
                }
              })
          , interval)
        })()
      })
    })
  }
}

module.exports = getRetryDecorator
