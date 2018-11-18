function funcRenamer (newName) {
  return function rename (fn) {
    try {
      Object.defineProperty(fn, 'name', { value: newName })
      return fn
    } catch (e) { // stupid safari: name is not configurable!
    }
    return fn
  }
}

module.exports = funcRenamer
