'use strict';

var Client = require('./client');
var dsl = require('./dsl')();
var path = require('path');
var Server = require('./server');
var Spec = require('./reporters/spec');
var Test = require('./test');
var UI = require('./ui');
var util = require('./util');

// Pocha
// ============================================================================

function Pocha(files, server) {
  this._files = loadFiles(files || []);
  this._tests = loadTests();
  if (server) {
    this._client = new Client(server);
  } else {
    this._server = new Server().start();
  }
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
  if (!this._client) {
    var ui = new UI(reporter);
  }
  var self = this;
  return reporter.runTests().then(function(tests) {
    self.emit('finished', tests);
    return tests;
  });
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
