'use strict';

var child_process = require('child_process');
var dsl = require('./dsl')();
var path = require('path');
var Spec = require('./reporters/spec');
var Test = require('./test');
var UI = require('./ui');
var util = require('./util');

// Pocha
// ============================================================================

function Pocha(files, server) {
  this._files = loadFiles(files || []);
  this._tests = loadTests();
}

function loadFiles(files) {
  files.forEach(function(file) {
    file = path.resolve(file);
    require(file);
  });
}

function loadTests() {
  return Test.fromNodes(dsl.topLevelDescribes);
}

/**
 * Get all the {@link Test}s, optionally matching a prefix or regular
 *   expression.
 * @api private
 * @instance
 * @param {?RegExp|string} [pattern]
 * @returns {Array<Test>}
 */
Pocha.prototype.getTests = function getTests(pattern) {
  var filter;
  if (!pattern) {
    return this._tests;
  } else if (pattern[0] === '/') {
    pattern = new RegExp(pattern.slice(1, pattern.length - 1));
    filter = function(test) {
      return test.fullTitle().match(pattern);
    };
  } else {
    filter = function(test) {
      return test.fullTitle().indexOf(pattern) === 0;
    }
  }
  return this._tests.filter(filter);
};

/**
 * List all the {@link Test}s, optionally matching a prefix or regular
 *   expression.
 * @api private
 * @instance
 * @param {?RegExp|string} [pattern]
 * @returns {Array<Test>}
 */
Pocha.prototype.listTests = function listTests(pattern) {
  var tests = this.getTests(pattern);
  tests.forEach(function(test) {
    console.log(test.fullTitle());
  });
  return tests;
};

/**
 * Run all the {@link Test}s, optionally matching a prefix or regular
 *   expression.
 * @api private
 * @instance
 * @param {?RegExp|string} [match]
 */
Pocha.prototype.runTests = function runTests(pattern) {
  var tests = this.getTests(pattern);

  // var reporter = new Spec(tests);
  // var ui = new UI(reporter);
  // return reporter.runTests();
  // tests.map(function(test) {

  // Child
  if (process.send) {
    Promise.all(tests.map(function(test) {
      return test.run();
    })).then(function() {
      tests.forEach(function(test) {
        test.err = test.err ? JSON.parse(util.stringifyError(test.err)) : null;
        process.send(test);
      });
    });
    return;
  }

  // Parent
  tests = tests.map(function(test) {
    // FIXME(mroberts): ...
    var promise = new Promise(function(resolve, reject) {
      var child = child_process.fork(__dirname + '/../bin/_pocha',
        ['-p', '/' + test.fullTitle() + '/', '--ipc', 'deadbeef']);
      child.on('message', function(result) {
        test._didRun = result._didRun;
        test._didFinish = result._didFinish;
        test.err = result.err;
        resolve(test);
      });
    });
    test.run = function run() {
      return promise;
    };
    return test;
  });

  var reporter = new Spec(tests);
  var ui = new UI(reporter);
  return reporter.runTests();
};

/**
 * Emit an event to any event listeners as well as to the server (if
 *   configured).
 * @api private
 * @instance
 * @param {string} event
 * @param {*} payload
 * @returns {boolean}
 */
Pocha.prototype.emit = function emit(event, payload) {
  if (this._client) {
    this._client.send(event, payload);
  }
  return EventEmitter.prototype.emit.call(this, event, payload);
};

module.exports = Pocha;
