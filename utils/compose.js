
function compose() {
  var fns = arguments;
  if (Array.isArray(fns[0])) {
    fns = fns[0];
  }

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      if (!fns[i]) continue;
      result = fns[i].call(this, result);
    }
    return result;
  };
};

module.exports = compose;
