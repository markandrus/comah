'use strict';

var ConcurrentRunner = require('./concurrent');
var inherits = require('util').inherits;
var os = require('os');
var Runner = require('./');

var DEFAULT_PARALLELISM = os.cpus().length;

// ParallelRunner
// ============================================================================

/**
 * Construct a {@link ParallelRunner}.
 * @api private
 * @class
 * @classdesc A {@link Runner} that runs {@link Test}s in parallel by forking
 *   child processes
 * @extends Runner
 * @param {?number} [parallelismLevel] - the number of child processes to fork
 *   (defaults to the number of CPUs in your computer)
 * @param {?Runner} [childRunner] - the {@link Runner} to use in
 *   child processes (defaults to {@link ConcurrentRunner})
 */
function ParallelRunner(parallelismLevel, childRunner) {
  Runner.call(this);
  this._parallelismLevel = parallelismLevel || DEFAULT_PARALLELISM;
  this._childRunner = childRunner || new ConcurrentRunner();
}

ParallelRunner.DEFAULT_PARALLELISM = DEFAULT_PARALLELISM;

inherits(ParallelRunner, Runner);

/**
 * Get the parallelism level (the number of child processes to fork) of this
 *   {@link ParallelRunner}.
 * @api private
 * @instance
 * @returns {number}
 */
ParallelRunner.prototype.getParallelismLevel = function getParallelismLevel() {
  return this._parallelismLevel;
};

/**
 * Get the child {@link Runner} used by this {@link ParallelRunner}.
 * @api private
 * @instance
 * @returns {Runner}
 */
ParallelRunner.prototype.getChildRunner = function getChildRunner() {
  return this._childRunner;
};

/**
 * Run {@link Test}s in parallel.
 * @api private
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
ParallelRunner.prototype.runTests = function runTests(tests) {
  throw new Error('Unimplemented');
};

module.exports = ParallelRunner;
