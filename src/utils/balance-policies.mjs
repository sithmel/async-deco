export function roundRobin (c, loads) {
  return c % loads.length
}

export function random (c, loads) {
  return Math.floor(Math.random() * loads.length)
}

export function idlest (c, loads) {
  var min = Math.min.apply(null, loads)
  return loads.indexOf(min)
}
