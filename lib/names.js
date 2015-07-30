'use strict';

var array = require('./fantasy/array');
var map = require('./fantasy/map');
var Name = require('./name');

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
 * @param {Map<String, NameSet>} [registry]
 * @param {Array<Name>} [names]
 */
function Names(registry, names) {
  this._registry = registry || new Map();
  this._names = names || [];
}

/**
 * Create a new {@link Name}.
 * @api private
 * @instance
 * @param {string} name
 * @param {Array<String>} [prefix]
 * @returns {Name}
 */
Names.prototype.createName = function createName(name, prefix) {
  prefix = prefix || [];
  var key = prefix.concat([name]).join(' ');
  var nameSet = this._registry.get(key) || NameSet.empty();
  var id = nameSet.getNextId();
  var newName = new Name(name, prefix, id);
  nameSet = nameSet.addName(newName);
  this._registry.set(key, nameSet);
  this._names.push(newName);
  return newName;
};

/**
 * Get {@link Name}s.
 * @api private
 * @instance
 * @returns {Array<Name>}
 */
Names.prototype.getNames = function getNames() {
  return this._names;
};

// Setoid
// ----------------------------------------------------------------------------

Names.prototype.equals = function equals(b) {
  return map.equals(this._registry, b._registry);
};

// Semigroup
// ----------------------------------------------------------------------------

Names.prototype.concat = function concat(b) {
  return new Names(
    map.concat(this._registry, b._registry),
    this._names.concat(b._names)
  );
};

// Monoid
// ----------------------------------------------------------------------------

Names.empty = function empty() {
  return new Names();
};

// Foldable
// ----------------------------------------------------------------------------

Name.prototype.reduce = function reduce(f, x) {
  return array.reduce(this.getNames(), f, x);
};

module.exports = Names;
