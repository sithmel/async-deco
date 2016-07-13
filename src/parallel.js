
function parallel(funcs) {
  var len = funcs.length;

  return function () {
    var currentFunc;
    var functions = funcs.slice(0);
    var index = 0;
    var done = false;
    var results = Array(len);
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args[args.length - 1];
    var context = this;

    function callback(i) {
      return function (err, res) {
        len--;
        if (done) {
          return; // into the bitbucket
        }
        if (err) {
          done = true;
          return cb(err);
        }
        results[i] = res;
        if (len === 0) {
          return cb(null, results);
        }
      };
    }

    while (functions.length) {
      currentFunc = functions.shift();
      args[args.length - 1] = callback(index);
      index++;
      currentFunc.apply(context, args);
    }
  };
}

module.exports = parallel;
