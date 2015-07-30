'use strict';

var array = require('./fantasy/array');

// Name
// ============================================================================

/**
 * Construct a {@link Name}.
 * @api private
 * @class
 * @classdesc Represents a name
 * @implements Setoid
 * @param {string} name
 * @param {?Array<string>} [prefix=[]]
 * @param {number} [id=0]
 */
function Name(name, prefix, id) {
  this._name = name;
  this._prefix = prefix || [];
  this._id = typeof id === 'number' ? id : 0;
}

Name.prototype.fullTitle = function fullTitle() {
  return this._prefix.concat([this._name]).join(' ');
};

// Setoid
// ----------------------------------------------------------------------------

Name.prototype.equals = function equals(b) {
  return this._name === b._name
    && array.equals(this._prefix, b._prefix)
    && this._id == this._id;
};

module.exports = Name;
