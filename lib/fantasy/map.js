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
 * Concatenate two Maps, using strict equality on the keys and `defaultConcat`
 *   on the values.
 * @api private
 * @param {Map} a
 * @param {Map} b
 * @returns {Map}
 */
function concat(as, bs) {
  var cs = new Map();
  as.forEach(function(value, key) {
    cs.set(key, value);
  });
  bs.forEach(function(value, key) {
    if (cs.has(key)) {
      value = util.defaultConcat(cs.get(key), value);
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

module.exports.equals = equals;
module.exports.concat = concat;
module.exports.empty = empty;
module.exports.map = map;
module.exports.reduce = reduce;
module.exports.traverse = traverse;
module.exports.sequence = sequence;
