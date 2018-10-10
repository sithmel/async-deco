var customArgumentsToken = '__ES6-PROMISIFY--CUSTOM-ARGUMENTS__'

/**
 * promisify()
 * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
 * an ES6-compatible Promise. Promisify provides a default callback of the form (error, result)
 * and rejects when `error` is truthy.
 *
 * @param {function} original - The function to promisify
 * @return {function} A promisified version of `original`
 */
module.exports = function promisify (original) {
  // Ensure the argument is a function
  if (typeof original !== 'function') {
    throw new TypeError('Argument to promisify must be a function')
  }

  // If the user has asked us to decode argument names for them, honour that
  var argumentNames = original[customArgumentsToken]

  // If the user has supplied a custom Promise implementation, use it. Otherwise
  // fall back to whatever we can find on the global object.
  var ES6Promise = Promise

  // If we can find no Promise implemention, then fail now.
  if (typeof ES6Promise !== 'function') {
    throw new Error('No Promise implementation found; do you need a polyfill?')
  }

  return function () {
    var _this = this

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key]
    }

    return new ES6Promise(function (resolve, reject) {
      // Append the callback bound to the context
      args.push(function callback (err) {
        if (err) {
          return reject(err)
        }

        for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          values[_key2 - 1] = arguments[_key2]
        }

        if (values.length === 1 || !argumentNames) {
          return resolve(values[0])
        }

        var o = {}
        values.forEach(function (value, index) {
          var name = argumentNames[index]
          if (name) {
            o[name] = value
          }
        })

        resolve(o)
      })

      // Call the function.
      original.call.apply(original, [_this].concat(args))
    })
  }
}
