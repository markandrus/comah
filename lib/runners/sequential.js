'use strict';

var ConcurrentRunner = require('./concurrent');
var inherits = require('util').inherits;

// SequentialRunner
// ============================================================================

/**
 * Construct a {@lik SequentialRunner}.
 * @class
 * @classdesc A {@link Runner} that runs {@link Test}s sequentially (i.e., a
 *   {@link ConcurrentRunner} with concurrency level 1)
 * @extends ConcurrentRunner
 */
function SequentialRunner() {
  ConcurrentRunner.call(this, 1);
}

inherits(SequentialRunner, ConcurrentRunner);

/**
 * Run {@link Test}s sequentially.
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
SequentialRunner.prototype.runTests;

module.exports = SequentialRunner;
