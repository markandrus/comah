'use strict';

var ConcurrentRunner = require('./concurrent');
var inherits = require('util').inherits;

// SequentialRunner
// ============================================================================

/**
 * Construct a {@lik SequentialRunner}.
 * @api private
 * @class
 * @classdesc A {@link Runner} that runs {@link Test}s sequentially (i.e., a
 *   {@link ConcurrentRunner} with concurrency level 1)
 * @extends ConcurrentRunner
 */
function SequentialRunner() {
  ConcurrentRunner.call(this, 1);
}

inherits(ConcurrentRunner, Runner);

/**
 * Run {@link Test}s sequentially.
 * @api private
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
SequentialRunner.prototype.runTests;

module.exports = SequentialRunner;
