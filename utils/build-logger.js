// gets an object and a logger function.
// it returns another object with 1 hidden properties
// __log a function that calls the logger with its arguments, the __ns and current time stamp
// the object returned has obj as prototype and it should behave like it

module.exports = function buildLogger(obj, name, id, logger) {
  if (typeof obj === 'object' && '__log' in obj) {
    return obj;
  }
  function ObjWithLogger(logger) {
    Object.defineProperty(this, '__log', {
      value: function (evt, payload) {
        var ts = Date.now();
        logger(name, id, ts, evt, payload);
      },
      enumerable: false
    });
  }

  ObjWithLogger.prototype = Object.create(obj || null);
  ObjWithLogger.prototype.constructor = ObjWithLogger;

  return new ObjWithLogger(logger);
};
