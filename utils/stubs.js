
function callback(output, time) {
  var counter = 0;
  var timeFunc = typeof time === 'function' ? time : function () { return time; };
  var outputFunc = typeof output === 'function' ? output : function () { return output; };
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args[args.length - 1];
    counter++;
    setTimeout((function (c) {
      return function () {
        var out = outputFunc(c);
        if (out instanceof Error) {
          cb(out);
        }
        else {
          cb(null, out);
        }
      };
    }(counter)), timeFunc(counter) || 0);
  };
}

function promise(output, time) {
  var cb = callback(output, time);
  return function () {
    return new Promise(function (resolve, reject) {
      cb(function (err, res) {
        if (err) {
          reject(err);
        }
        else {
          resolve(res);
        }
      });
    });
  };
}

module.exports = {
  callback: callback,
  promise: promise
};
