'use strict';

var array = require('./array');
var ConcurrentRunner = require('./concurrent');
var Deferred = require('./deferred');
var inherits = require('util').inherits;
var os = require('os');
var promise = require('./promise');
var Runner = require('./');

var DEFAULT_PARALLELISM = os.cpus().length;
var _POCHA = __dirname + '/../../bin/_pocha';

// ParallelRunner
// ============================================================================

/**
 * Construct a {@link ParallelRunner}.
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
 * @instance
 * @returns {number}
 */
ParallelRunner.prototype.getParallelismLevel = function getParallelismLevel() {
  return this._parallelismLevel;
};

/**
 * Get the child {@link Runner} used by this {@link ParallelRunner}.
 * @instance
 * @returns {Runner}
 */
ParallelRunner.prototype.getChildRunner = function getChildRunner() {
  return this._childRunner;
};

/**
 * Run {@link Test}s in parallel.
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
ParallelRunner.prototype.runTests = function runTests(tests) {
  tests = tests || [];

  // Array<Array<Test>>
  var testGroups = array.splitInto(this.getParallelismLevel(), tests);

  // Array<Promise<Array<Test>>>
  testGroups = testsGroups.map(this.runTestsInChildProcess, this);

  // Promise<Array<Array<Test>>>
  testGroups = array.sequence(testGroups, promise.of);

  // Promise<Array<Test>>
  return promise.map(testGroups, array.join);
};

/**
 * Run {@link Test}s in a child process using the child {@link Runner}.
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Promise<Array<Test>>}
 */
ParallelRunner.prototype.runTestsInChildProcess =
  function runTestsInChildProcess(tests)
{
  tests = tests || [];

  var testMap = new Map();
  var deferredMap = new Map();
  var promises = [];

  tests.forEach(function(test) {
    var fullTitle = test.fullTitle();
    testMap.set(fullTitle, test);

    var deferred = new Deferred();
    deferredMap.set(test, deferred);

    var promise = deferred.promise;
    promises.push(promise);
    test.setPromise(promise);
  });

  var child = this.forkChildProcessForTests(tests);

  child.on('testResult', function(testResult) {
    var fullTitle = Test.prototype.fullTitle.call(testResult);
    var test = testMap.get(fullTitle);
    test.setProperties(testResult);
    deferredMap.get(test).resolve(test);
  });

  return Promise.all(promises);
};

/**
 * Get the command-line arguments to pass to a forked child process in order to
 *   run the specified {@link Test}s in the child {@link Runner}.
 * @instance
 * @param {?Array<Test>} [tests]
 * @returns {Array<String>}
 */
ParallelRunner.prototype.getChildProcessCommandLineArguments =
  function getChildProcessCommandLineArguments(tests)
{
  tests = tests || [];

  var testNames = tests.map(function(test) {
    return test.fullTitle();
  });

  var args = ['--tests', testNames];

  var childRunner = this.getChildRunner();
  if (childRunner instanceof ConcurrentRunner) {
    args = args.concat(
      ['--runner', 'concurrent', '-k', childRunner.getConcurrencyLevel()]);
  } else {
    throw new Error('Unsupported child runner');
  }

  return args;
};

ParallelRunner.prototype.forkChildProcessForTests =
  function forkChildProcessForTests(tests)
{
  return child_process.fork(_POCHA,
    this._getChildProcessCommandLineArguments(tests));
};

module.exports = ParallelRunner;
