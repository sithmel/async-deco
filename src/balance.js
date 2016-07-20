var defaultLogger = require('../utils/default-logger');
var balancePolicies = require('../utils/balance-policies');

function balanceDecorator(wrapper, policy) {
  policy = policy || balancePolicies.idlest;
  return wrapper(function (funcs) {
    var loads = funcs.map(function () {return 0;});
    var executionNumber = 0;

    return function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var logger = defaultLogger.apply(context);
      var cb = args[args.length - 1];
      var selected = policy.call(context, executionNumber++, loads, args);
      loads[selected]++;

      args[args.length - 1] = function (err, res) {
        loads[selected]--;
        cb(err, res);
      };

      logger('balance-execute', {loads: loads, executing: selected});

      funcs[selected].apply(context, args);
    };
  });
}



module.exports = balanceDecorator;
