import objId from './utils/obj-id'
import LRUCache from 'little-ds-toolkit/lib/lru-cache'
import funcRenamer from './utils/func-renamer'

export default function getMemoizeDecorator (opts = {}) {
  const { len, ttl } = opts
  return function memoize (func) {
    const renamer = funcRenamer(`memoize(${func.name || 'anonymous'})`)
    const cache = new LRUCache({ maxLen: len, defaultTTL: ttl })
    return renamer(function (...deps) {
      const key = objId.getIdFromValues(deps)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...deps)
      cache.set(key, result)
      return result
    })
  }
}
