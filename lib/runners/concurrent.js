'use strict'

var inherits = require('util').inherits;
var Runner = require('./');

var DEFAULT_CONCURRENCY = 5;

// ConcurrentRunner
// ============================================================================

/**
 * Construct a {@link ConcurrentRunner}.
 * @api private
 * @class
 * @classdesc A {@link Runner} that runs {@link Test}s concurrently
 * @extends Runner
 * @param {?number} [concurrencyLevel=5] - the number of tests to run
 *   concurrently (must be greater than or equal to 1, if specified)
 */
function ConcurrentRunner(concurrencyLevel) {
  Runner.call(this);
  this._concurrencyLevel = concurrencyLevel || DEFAULT_CONCURRENCY;
}

ConcurrentRunner.DEFAULT_CONCURRENCY = DEFAULT_CONCURRENCY;

inherits(ConcurrentRunner, Runner);

/**
 * Get the concurrency level of this {@link ConcurrentRunner}.
 * @api private
 * @instance
 * @returns {number}
 */
ConcurrentRunner.prototype.getConcurrencyLevel = function getConcurrencyLevel() {
  return this._concurrencyLevel;
};

/**
 * Run {@link Test}s concurrently.
 * @api private
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
ConcurrentRunner.prototype.runTests = function runTests(tests) {
  throw new Error('Unimplemented');
};

module.exports = ConcurrentRunner;
