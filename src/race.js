
function race(funcs) {

  return function () {
    var currentFunc;
    var functions = funcs.slice(0);
    var i = functions.length;
    var done = false;
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args[args.length - 1];
    var context = this;

    args[args.length - 1] = function (err, res) {
      if (done) {
        return; // into the bitbucket
      }
      if (err && i === 0) {
        i--;
        return cb(err, res);
      }
      if (!err) {
        done = true;
        return cb(err, res);
      }
    };

    while (functions.length) {
      currentFunc = functions.shift();
      currentFunc.apply(context, args);
    }
  };
}

module.exports = race;
