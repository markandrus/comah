'use strict';

var doneable = require('./doneable');

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
  this._didRun = false;
  this._timeout = null;
  this._beforeEach = null;
  this._afterEach = null;
}

/**
 * Run the {@link Describe}'s definition function (`def`).
 * @api private
 * @instance
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.run = function run() {
  if (!this._didRun) {
    this._def();
    this._didRun = true;
  }
  return this;
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
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.beforeEach = function(def) {
  this._beforeEach = this._beforeEach
    ? this._beforeEach.then(doneable.toLazyPromise(def))
    : def;
  return this;
};

/**
 * Specify a function to run after each test (same as `afterEach`).
 * @api private
 * @instance
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.after = Describe.prototype.afterEach;

/**
 * Specify a function to run after each test.
 * @api private
 * @instance
 * @param {function} def
 * @returns {Describe}
 */
Describe.prototype.afterEach = function afterEach(def) {
  this._afterEach = this._afterEach
    ? this._afterEach.then(doneable.toLazyPromise(def))
    : def;
  return this;
};

/**
 * Specify the timeout of this {@link Describe} (cascades down to other
 *   {@link Describe}s and {@link It}s).
 * @api private
 * @instance
 * @param {number} [milliseconds]
 * @returns {Describe}
 */
Describe.prototype.timeout = function timeout(milliseconds) {
  this._timeout = milliseconds;
  return this;
};

module.exports = Describe;
