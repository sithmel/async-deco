function funcRenamer (name, doDecorate) {
  return function rename (fn) {
    var newName = doDecorate && fn.name ? name + '(' + fn.name + ')' : name
    try {
      Object.defineProperty(fn, 'name', { value: newName })
      return fn
    } catch (e) { // stupid safari: name is not configurable!
    }
    return fn
  }
}

module.exports = funcRenamer
