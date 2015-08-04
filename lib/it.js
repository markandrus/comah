'use strict';

var doneable = require('./doneable');

// It
// ============================================================================

/**
 * Construct an {@link It}.
 * @api private
 * @class
 * @classdesc Describes a unit of functionality to be tested
 * @param {string} name
 * @param {Doneable} def
 */
function It(name, def) {
  this._name = name;
  this._def = def.bind(this);
  this._timeout = null;
}

/**
 * Get the {@link It}'s definition function.
 * @instance
 * @returns {function}
 */
It.prototype.getDef = function getDef() {
  return this._def;
};

/**
 * Get the {@link It}'s name.
 * @instance
 * @returns {string}
 */
It.prototype.getName = function getName() {
  return this._name;
};

/**
 * Specify the timeout of this {@link It} (cascades down to other
 *   {@link Describe}s and {@link It}s).
 * @api private
 * @instance
 * @param {number} [milliseconds]
 * @returns {It}
 */
It.prototype.timeout = function timeout(milliseconds) {
  this._timeout = milliseconds;
};

/**
 * Get the timeout of the test defined by this {@link It}.
 * @instance
 * @returns {?number}
 */
It.prototype.getTimeout = function getTimeout() {
  return this._timeout;
};

module.exports = It;
