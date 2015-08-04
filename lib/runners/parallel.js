'use strict';

var array = require('../array');
var child_process = require('child_process');
var ConcurrentRunner = require('./concurrent');
var Deferred = require('../deferred');
var inherits = require('util').inherits;
var os = require('os');
var promise = require('../promise');
var Runner = require('./');
var Test = require('../test');

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
  testGroups = testGroups.map(this.runTestsInChildProcess, this);

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

  tests.forEach(function(test) {
    var fullTitle = test.fullTitle();
    testMap.set(fullTitle, test);
  });

  var child = this.forkChildProcessForTests(tests);

  var self = this;

  var events = new Set();
  events.add('testStarted');
  events.add('testFailed');
  events.add('testPassed');

  child.on('message', function(message) {
    var event = message.event;

    if (!events.has(event)) {
      return;
    }

    var _test = message.value;
    _test.__proto__ = Test.prototype;
    var fullTitle = _test.fullTitle();
    var test = testMap.get(fullTitle);

    switch (event) {
      case 'testStarted':
        test.setStarted(_test.getStartTime());
        return;
      case 'testFailed':
        test.setFinished(_test.err, _test.getFinishTime());
        test.getDeferred().reject(_test.err);
        break;
      case 'testPassed':
        test.setFinished(null, _test.getFinishTime());
        test.getDeferred().resolve();
    }
  });

  return Promise.all(tests.map(function(test) {
    return test.getPromise();
  }));
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

  var args = ['--tests', testNames, '--reporter', 'ipc'];

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
    this.getChildProcessCommandLineArguments(tests));
};

module.exports = ParallelRunner;
