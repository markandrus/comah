'use strict';

var Base = require('mocha/lib/reporters/base');
var color = Base.color;
var util = require('util');
var inherits = util.inherits;
var Reporter = require('./');

var SPINNER_INTERVAL = 75;

// SpecReporter
// ============================================================================

function SpecReporter(tests) {
  this._reporter = new Reporter(tests);

  var pair = makeLines(tests);
  this._lines = pair[0];
  this._indices = pair[1];

  var self = this;

  this._spinner = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
  setInterval(function() {
    self._spinner = shiftLeft(self._spinner);
    self.emit('changed');
  }, SPINNER_INTERVAL);

  this._reporter.on('testFinished', function(test) {
    self._lines[self._indices.get(test)] = makeTestLine(test);
    self.emit('testFinished', test);
  });

  this._reporter.on('testPassed', function(test) {
    self.emit('testPassed', test);
  });

  this._reporter.on('testFailed', function(test) {
    self.emit('testFailed', test);
  });

  this._reporter.on('testsFinished', function(tests) {
    makeEpilogue(self);
    self.emit('testsFinished', tests);
  });
}

SpecReporter.NEEDS_UI = true;

inherits(SpecReporter, Reporter);

SpecReporter.prototype.getSpinner = function getSpinner() {
  return this._spinner[0];
};

SpecReporter.prototype.toString = function toString() {
  return '\n\n' + this._lines.join('\n').replace(/{spinner}/g,
    this.getSpinner()) + '\n';
};

// Helpers
// ----------------------------------------------------------------------------

function makeEpilogue(spec) {
  spec._lines.push('');

  // HACK(mroberts): ...
  var log = console.log;
  console.log = function() {
    var args = [].slice.apply(arguments);
    var lines = util.format.apply(console, args).split('\n');
    spec._lines = spec._lines.concat(lines);
  };
  Base.prototype.epilogue.call(spec._reporter);
  console.log = log;
}

function makeDescribeLine(name, i) {
  i = i || 0;
  return new Array(i + 2).join('  ') + name;
}

function makeTestLine(test) {
  var i = test.getPrefix().length;
  var c = 'pending';
  var x = color(c, '{spinner}');
  var finished = test.getFinished();
  if (finished && test.err) {
    c = 'fail';
    x = color('fail', '✖');
  } else if (finished) {
    c = 'pass';
    x = color('checkmark', '✓');
  }
  return new Array(i + 2).join('  ') + x + ' ' + color(c, test.getName());
}

function makeLines(tests) {
  var lines = [];
  var indices = new Map();
  var map = new Map();
  tests.forEach(function(test) {
    test.getPrefix().reduce(function(map, key, i) {
      if (!map.has(key)) {
        lines.push(makeDescribeLine(key, i));
        map.set(key, new Map());
      }
      return map.get(key);
    }, map);
    lines.push(makeTestLine(test));
    indices.set(test, lines.length - 1);
  });
  return [lines, indices];
}

function shiftLeft(as) {
  return as.slice(1).concat([as[0]]);
}

module.exports = SpecReporter;
