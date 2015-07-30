'use strict';

var util = require('../util');

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
    if (!util.defaultEquals(as[i], bs[i])) {
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

module.exports.equals = equals;
module.exports.concat = concat;
module.exports.empty = empty;
module.exports.reduce = reduce;
