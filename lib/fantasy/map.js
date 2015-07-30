'use strict';

var set = require('./set');
var util = require('../util');

// Map
// ============================================================================

// Setoid
// ----------------------------------------------------------------------------

/**
 * Check Map equality using strict equality on the keys and strict equality
 * on the values, respective of order.
 * @api private
 * @param {Map} a
 * @param {Map} b
 * @returns {boolean}
 */
function equals(as, bs) {
  var aks = new Set(as.keys());
  var bks = new Set(bs.keys());
  if (!set.equals(aks, bks)) {
    return false;
  }

  for (var key of aks) {
    if (!util.defaultEquals(as.get(key), bs.get(key))) {
      return false;
    }
  }

  return true;
}

// Concat
// ----------------------------------------------------------------------------

/**
 * Concatenate two Maps, using strict equality on the keys and taking the first
 * value inserted.
 * @api private
 * @param {Map} a
 * @param {Map} b
 * @returns {Map}
 */
function concat(as, bs) {
  return concat1(as, bs, util.defaultConcat);
}

// Concat1
// ----------------------------------------------------------------------------

/**
 * Concatenate two Maps, using strict equality on the keys and concatenating
 * values with `valueConcat`.
 * @api private
 * @param {Map} a
 * @param {Map} b
 * @param {function} valueConcat
 * @returns {Map}
 */
function concat1(as, bs, valueConcat) {
  var cs = new Map();
  as.forEach(function(value, key) {
    cs.set(key, value);
  });
  bs.forEach(function(value, key) {
    if (cs.has(key) {
      value = valueConcat(cs.get(key), value);
    }
    cs.set(key, value);
  });
  return cs;
}

// Monoid
// ----------------------------------------------------------------------------

function empty() {
  return new Map();
}

// Functor
// ----------------------------------------------------------------------------

function map(as, f) {
  var cs = new Map();
  as.forEach(function(value, key) {
    cs.set(key, f(value));
  });
  return cs;
}

// Foldable
// ----------------------------------------------------------------------------

function reduce(as, f, x) {
  as.forEach(function(value) {
    x = f(value, x);
  });
  return x;
}

// Traversable
// ----------------------------------------------------------------------------

function traverse(as, f, of) {
  throw new Error('Unimplemented');
}

function sequence(as, of) {
  return traverse(as, util.id, of);
}

module.exports = equals;
module.exports = equals2;
module.exports = concat;
module.exports = concat1;
module.exports = empty;
