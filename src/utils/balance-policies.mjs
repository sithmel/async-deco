export function roundRobin (c, loads) {
  return c % loads.length
}

export function random (c, loads) {
  return Math.floor(Math.random() * loads.length)
}

export function idlest (c, loads) {
  const min = Math.min(...loads)
  return loads.indexOf(min)
}
