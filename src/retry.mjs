import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

const customSetTimeout = (func, interval) => interval ? setTimeout(func, interval) : func()

export default function getRetryDecorator (opts = {}) {
  const times = opts.times || Infinity
  const interval = opts.interval || 0
  const intervalFunc = typeof interval === 'function'
    ? interval
    : () => interval

  return function retry (func) {
    const renamer = funcRenamer(`retry(${func.name || 'anonymous'})`)
    return renamer(function _retry (...args) {
      const context = this
      const logger = getLogger(context)
      let counter = 0

      return new Promise((resolve, reject) => {
        (function retry () {
          const interval = counter ? intervalFunc(counter) : 0
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
