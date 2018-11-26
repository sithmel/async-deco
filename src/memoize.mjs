import objId from './utils/obj-id'
import LRUCache from 'little-ds-toolkit/lib/lru-cache'

export default function cacheDependency ({ len, ttl }) {
  return function _cacheDependency (func) {
    const cache = new LRUCache({ maxLen: len, defaultTTL: ttl })
    return function cachedService (...deps) {
      const key = objId.getIdFromValues(deps)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...deps)
      cache.set(key, result)
      return result
    }
  }
}
