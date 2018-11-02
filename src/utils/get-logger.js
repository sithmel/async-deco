module.exports = function getLogger (logger) {
  if (typeof logger === 'undefined') {
    return () => {}
  }
  return (evt, payload) => {
    const ts = Date.now()
    logger(evt, payload, ts)
  }
}
