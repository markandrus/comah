'use strict';

var array = require('../fantasy/array');

// Name Set
// ============================================================================

/**
 * Construct a {@link NameSet}.
 * @api private
 * @class
 * @classdesc A {@link NameSet} contains {@link Name}s sharing the same `name`
 *   and `prefix` ordered by `id`
 * @implements Setoid
 * @implements Semigroup
 * @implements Monoid
 * @implements Foldable
 * param {Set<Name>} [names] - `id` must be increasing
 */
function NameSet(names) {
  this._names = names || [];
  this._greatestId = this._names.length
    ? this._names[this._names.length - 1]._id
    : -1;
}

/**
 * Add a {@link Name} to the {@link NameSet}. The
 *   {@link Name} must share the same `name` and `prefix` as all the other
 *   {@link Name}s, and its `id` must be one greater than all the others
 *   (unchecked).
 * @api private
 * @instance
 * @param {Name} name
 * @returns {NameSet}
 */
NameSet.prototype.addName = function addName(name) {
  return new NameSet(this._names.concat([name]));
};

/**
 * Get {@link Name}s.
 * @api private
 * @instance
 * @returns {Array<Name>}
 */
NameSet.prototype.getNames = function getNames() {
  return this._names;
};

NameSet.prototype.getNextId = function getNextId() {
  return this._greatestId + 1;
};

// Setoid
// ----------------------------------------------------------------------------

NameSet.prototype.equals = function equals(b) {
  return array.equals(this._names, b._names);
};

// Semigroup
// ----------------------------------------------------------------------------

NameSet.prototype.concat = function concat(b) {
  var offset = this._greatestId + 1;
  return new NameSet(this._names.concat(b._names.map(function(name) {
    return new Name(name._name, name._prefix, name._id + offset);
  })));
};

// Monoid
// ----------------------------------------------------------------------------

NameSet.empty = function empty() {
  return new NameSet();
};

// Foldable
// ----------------------------------------------------------------------------

NameSet.prototype.reduce = function reduce(f, x) {
  return array.reduce(this._names, f, x);
};

module.exports = NameSet;
