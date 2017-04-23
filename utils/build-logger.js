// gets an object and a logger function.
// it returns another object with 1 hidden properties
// __log a function that calls the logger with its arguments and current time stamp
// the object returned has obj as prototype and it should behave like it

function wrap(obj) {
  var ObjWithLogger = function () {
    Object.defineProperty(this, '__log_funcs', {
      value: [],
      enumerable: false
    });

    Object.defineProperty(this, '__log', {
      value: (function (evt, payload) {
        var ts = Date.now();
        var logger, logKey;
        for (var i = 0; i < this.__log_funcs.length; i++) {
          logger = this.__log_funcs[i].logger;
          logKey = this.__log_funcs[i].logKey;
          logger(evt, payload, ts, logKey);
        }
      }).bind(this),
      enumerable: false
    });
  };

  ObjWithLogger.prototype = Object.create(obj || null);
  ObjWithLogger.prototype.constructor = ObjWithLogger;

  return new ObjWithLogger();
}

module.exports = function buildLogger(obj, logger, logKey) {
  if (!(typeof obj === 'object' && '__log' in obj)) {
    obj = wrap(obj); // it only decorate once
  }
  obj.__log_funcs.push({ logger: logger, logKey: logKey });
  return obj;
};
