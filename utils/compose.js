
function compose() {
  var fns = Array.prototype.slice.call(arguments);
  if (Array.isArray(fns[0])) {
    fns = fns[0];
  }

  fns = fns
  .filter(function (f) {
    return f;
  });

  if (!fns.length) {
    fns = [ function (f) {return f;} ];
  }

  return fns
  .reduce(function (f, g) {
    return function () {
      return f(g.apply(this, arguments));
    };
  });
}

module.exports = compose;
