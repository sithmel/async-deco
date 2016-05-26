
function safe(func) {
  return function () {
    var context = this;
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args[args.length - 1];
    var alreadyFired = false;
    args[args.length - 1] = function (err, res) {
      if (alreadyFired) {
        throw new Error('Callback fired twice');
      }
      else {
        alreadyFired = true;
        cb(err, res);
      }
    };

    try {
      func.apply(context, args);
    }
    catch (e) {
      if (alreadyFired) {
        throw e;
      }
      cb(e);
    }
  };
}

module.exports = safe;
