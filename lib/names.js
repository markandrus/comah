'use strict';

var map = require('./fantasy/map');
var Name = require('./name');
var set = require('./fantasy/set');

// Names
// ============================================================================

/**
 * Construct {@link Names}.
 * @api private
 * @implements Setoid
 * @implements Semigroup
 * @implements Monoid
 * @class
 * @classdesc Ensures all the {@link Name}s it generates are unique
 * @param {Map<String, Set<Name>>} registry
 */
function Names(registry) {
  this._registry = registry || new Map();
}

// FIXME(mroberts): Rewrite pure version.
Names.prototype.newName = function newName(name, prefix) {
  prefix = prefix || [];
  var id = 1;
  var key = prefix.concat([name]).join(' ');
  if (this._registry.has(key)) {
    id = this._registry.get(key) + 1;
  }
  this._registry.set(key, id);
  return new Name(name, prefix, id);
};

// Setoid
// ----------------------------------------------------------------------------

Names.prototype.equals = function equals(b) {
  return map.equals1(this._registry, b._registry, function(x, y) {
    return Name.prototype.equals.call(x, y);
  });
};

// Semigroup
// ----------------------------------------------------------------------------

Names.prototype.concat = function concat(b) {
  return new Names(map.concat1(this._registry, b._registry, function(x, y) {
    return set.concat(x, y);
  }));
};

// Monoid
// ----------------------------------------------------------------------------

Names.empty = function empty() {
  return new Names();
};

module.exports = Names;
