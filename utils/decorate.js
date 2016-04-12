var compose = require('./compose');

function decorate() {
  var args = Array.prototype.slice.call(arguments, 0);

  if (Array.isArray(args[0])) {
    args = args[0];
  }

  var dec = compose.apply(this, args.slice(0, -1));
  return dec(args[args.length - 1]);
}

module.exports = decorate;
