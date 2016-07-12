var policies = {};

policies.roundRobin = function (c, loads) {
  return c % loads.length;
};

policies.random = function (c, loads) {
  return Math.floor(Math.random() * loads.length);
};

policies.idlest = function (c, loads) {
  var min = Math.min.apply(null, loads);
  return loads.indexOf(min);
};

module.exports = policies;
