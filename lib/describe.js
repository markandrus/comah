'use strict';

var toLazyPromise = require('./doneable').toLazyPromise;

// Describe
// ============================================================================

/**
 * Construct a {@link Describe}.
 * @api private
 * @class
 * @classdesc Describes units of functionality to be tested
 * @param {string} name
 * @param {function} def
 */
function Describe(name, def) {
  this._name = name;
  this._def = def.bind(this);
  this._ran = false;
  this._timeout = null;
  this._beforeEach = [];
  this._afterEach = [];
}

/**
 * Run the {@link Describe}'s definition function.
 * @api private
 * @instance
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.run = function run() {
  if (!this._ran) {
    this.getDef()();
    this._ran = true;
  }
  return this;
};

/**
 * Get the {@link Describe}'s definition function.
 * @instance
 * @returns {function}
 */
Describe.prototype.getDef = function getDef() {
  return this._def;
};

/**
 * Get the {@link Describe}'s name.
 * @instance
 * @returns {string}
 */
Describe.prototype.getName = function getName() {
  return this._name;
};

/**
 * Specify a function to run before each test (same as `beforeEach`).
 * @api private
 * @instance
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.before = Describe.prototype.beforeEach;

/**
 * Specify a function to run before each test.
 * @api private
 * @instance
 * @param {Doneable} doneable
 * @returns {Describe}
 */
Describe.prototype.beforeEach = function(doneable) {
  this._beforeEach.push(doneable);
  return this;
};

/**
 * Get the function(s) to run before each test.
 * @instance
 * @returns {Array<Doneable>}
 */
Describe.prototype.getBeforeEach = function getBeforeEach() {
  return this._beforeEach;
};

/**
 * Specify a function to run after each test (same as `afterEach`).
 * @api private
 * @instance
 * @param {Doneable} doneable
 * @returns {Describe}
 */
Describe.prototype.after = Describe.prototype.afterEach;

/**
 * Specify a function to run after each test.
 * @api private
 * @instance
 * @param {Doneable} doneable
 * @returns {Describe}
 */
Describe.prototype.afterEach = function afterEach(doneable) {
  this._afterEach.push(doneable);
  return this;
};

/**
 * Get the function(s) to run after each test.
 * @instance
 * @returns {Array<Doneable>}
 */
Describe.prototype.getAfterEach = function getAfterEach() {
  return this._afterEach;
};

/**
 * Specify the timeout of this {@link Describe} (cascades down to other
 *   {@link Describe}s and {@link It}s).
 * @api private
 * @instance
 * @param {?number} [milliseconds]
 * @returns {Describe}
 */
Describe.prototype.timeout = function timeout(milliseconds) {
  this._timeout = milliseconds;
  return this;
};

/**
 * Get the timeout for each test defined by this {@link Describe}.
 * @instance
 * @returns {?number}
 */
Describe.prototype.getTimeout = function getTimeout() {
  return this._timeout;
};

module.exports = Describe;
