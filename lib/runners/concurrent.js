'use strict'

var array = require('./array');
var inherits = require('util').inherits;
var Runner = require('./');

var DEFAULT_CONCURRENCY = 5;

// ConcurrentRunner
// ============================================================================

/**
 * Construct a {@link ConcurrentRunner}.
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
 * @instance
 * @returns {number}
 */
ConcurrentRunner.prototype.getConcurrencyLevel = function getConcurrencyLevel() {
  return this._concurrencyLevel;
};

/**
 * Run {@link Test}s concurrently.
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
ConcurrentRunner.prototype.runTests = function runTests(tests) {
  tests = tests || [];
  var pair = array.splitAt(this.getConcurrencyLevel(), tests);
  var queuedTests = pair[1];
  var initialTests = tests = pair[0];
  initialTests.forEach(function(test) {
    test.run();
  });
  return Promise.all(tests.map(function(test) {
    return test.getPromise().then(function() {
      var nextTest = queuedTests.pop();
      if (nextTest) {
        nextTest.run();
      }
      return test;
    });
  }));
};

module.exports = ConcurrentRunner;
