'use strict';

/**
 * A {@link Doneable} is a function, optionally taking a single callback `done`
 *   as its argument.
 * @api private
 * @typedef {function} Doneable
 */

/**
 * A {@link LazyPromise} is a function which returns a Promise.
 * @api private
 * @typedef {function} LazyPromise
 */

/**
 * Convert an Array of {@link Doneable}s to a Promise.
 * @api private
 * @param {Array<Doneable>} doneables
 * @returns {Promise}
 */
function sequence(doneables) {
  if (!doneables.length) {
    return Promise.resolve();
  }
  var doneable = doneables[0];
  doneables = doneables.slice(1);
  return toPromise(doneable).then(function() {
    return sequence(doneables);
  });
}

/**
 * Convert a {@link Doneable} to a {@link LazyPromise}.
 * @api private
 * @param {Doneable} doneable
 * @returns {LazyPromise}
 */
function toLazyPromise(doneable) {
  return toPromise.bind(null, doneable);
}

/**
 * Convert a {@link Doneable} to a Promise.
 * @api private
 * @param {Doneable} doneable
 * @returns {Promise}
 */
function toPromise(doneable) {
  return new Promise(function(resolve, reject) {
    function done(error) {
      if (arguments.length) {
        return reject(error);
      }
      resolve();
    }
    if (doneable.length) {
      return doneable(done);
    } else {
      doneable();
      resolve();
    }
  });
}

module.exports.sequence = sequence;
module.exports.toLazyPromise = toLazyPromise;
module.exports.toPromise = toPromise;
