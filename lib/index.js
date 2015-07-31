'use strict';

var dsl = require('./dsl')();
var path = require('path');
var Spec = require('./reporters/spec');
var Test = require('./test');
var UI = require('./ui');

// Pocha
// ============================================================================

function Pocha(files) {
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
 * @returns {Promise<Array<Test>>}
 */
Pocha.prototype.runTests = function runTests(pattern) {
  var tests = this.getTests(pattern);
  var reporter = new Spec(tests);
  var ui = new UI(reporter);
  reporter.runTests();
};

module.exports = Pocha;
