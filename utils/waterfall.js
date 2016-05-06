
function waterfall() {
  var funcs = Array.prototype.slice.call(arguments, 0);
  funcs = Array.isArray(funcs[0]) ? funcs[0] : funcs;
  return function () {
    var functions = funcs.slice(0);
    var currentFunc;
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args[args.length - 1];
    var context = this;

    function callback(err, res) {
      if (err) {
        return cb(err);
      }
      if (functions.length === 0) {
        return cb(null, res);
      }
      currentFunc = functions.shift();
      currentFunc.apply(context, [res, callback]);
    }
    currentFunc = functions.shift();
    args[args.length - 1] = callback;
    currentFunc.apply(context, args);
  }
}

module.exports = waterfall;
