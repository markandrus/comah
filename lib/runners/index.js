'use strict';

// Runner
// ============================================================================

/**
 * Construct a {@link Runner}.
 * @api private
 * @class
 * @classdesc A {@link Runner} runs {@link Test}s.
 */
function Runner() {
}

/**
 * Run {@link Test}s.
 * @api private
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
Runner.prototype.runTests = function runTests(tests) {
  throw new Error('Unimplemented');
};

module.exports = Runner;
