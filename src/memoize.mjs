import { getLogger } from './add-logger'
import LRUCache from 'little-ds-toolkit/lib/lru-cache'
import funcRenamer from './utils/func-renamer'

const returnDefault = () => '_default'

export default function getMemoizeDecorator (opts = {}) {
  const getKey = opts.getKey || returnDefault
  const defaultTTL = opts.ttl
  const maxLen = opts.len
  const cache = new LRUCache({ maxLen: maxLen, defaultTTL: defaultTTL })

  return function memoize (func) {
    const renamer = funcRenamer(`memoize(${func.name || 'anonymous'})`)
    return renamer(function _memoize (...args) {
      const context = this
      const logger = getLogger(context)
      const cacheKey = getKey.apply(context, args)

      if (cacheKey === null) {
        return func.apply(context, args)
      }

      if (cache.has(cacheKey)) {
        const result = cache.get(cacheKey)
        logger('memoize-hit', { key: cacheKey, result: result })
        return Promise.resolve(result)
      } else {
        return func.apply(context, args)
          .then((res) => {
            cache.set(cacheKey, res)
            return res
          })
      }
    })
  }
}
