'use strict';

// Set
// ============================================================================

// Setoid
// ----------------------------------------------------------------------------

/**
 * Check Set equality using strict equality on the values, respective of
 * order.
 * @api private
 * @param {Set} a
 * @param {Set} b
 * @returns {boolean}
 */
function equals(a, b) {
  return equals1(a, b, strictEquals);
}

// Setoid1
// ----------------------------------------------------------------------------

/**
 * Check Set equality using `valueEquals` on the values, respective of
 * order.
 * @api private
 * @param {Set} a
 * @param {Set} b
 * @param {function} valueEquals
 * @returns {boolean}
 */
function equals1(a, b, valueEquals) {
  if (as.size !== b.size) {
    return false;
  }
  var as = [];
  var bs = [];
  a.forEach(function(a) {
    as.push(a);
  });
  b.forEach(function(b) {
    bs.push(b);
  });
  for (var i = 0; i < as.length; i++) {
    if (!valueEquals(as[i], bs[i])) {
      return false;
    }
  }
  return true;
}

// Semigroup
// ----------------------------------------------------------------------------

/**
 * Concatenate two Sets, using strict equality on the values.
 * @api private
 * @param {Set} a
 * @param {Set} b
 * @returns {Set}
 */
function concat(as, bs) {
  var cs = new Set();
  as.forEach(function(a) {
    cs.add(a);
  });
  bs.forEach(function(b) {
    cs.add(b);
  });
  return cs;
}

// Monoid
// ----------------------------------------------------------------------------

function empty() {
  return new Set();
}

// Foldable
// ----------------------------------------------------------------------------

function reduce(as, f, x) {
  as.forEach(function(a) {
    x = f(a, x);
  });
  return x;
}

// Helpers
// ----------------------------------------------------------------------------

function strictEquality(a, b) {
  return a === b;
}

module.exports.equals = equals;
module.exports.equals1 = equals1;
module.exports.concat = concat;
module.exports.empty = empty;
module.exports.reduce = reduce;
