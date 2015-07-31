'use strict';

var Base = require('mocha/lib/reporters/base');
var color = Base.color;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var spinner = ['-', '\\', '|', '/', '-', '\\', '|', '/'];

function shiftLeft(array) {
  return array.slice(1).concat([array[0]]);
}

// Spec
// ============================================================================

function Spec(tests) {
  tests = tests || [];
  EventEmitter.call(this);

  this._tests = tests;
  var pair = makeLines(tests);
  this._lines = pair[0];
  this._indices = pair[1];

  this._startTime = null;
  this._endTime = null;

  this._spinner = spinner;

  this.failures = [];
  this.stats = {
    duration: 0,
    failures: 0,
    passes: 0,
    pending: 0
  };

  var self = this;
  setInterval(function() {
    self._spinner = shiftLeft(self._spinner);
    self.emit('changed');
  }, 75);
}

util.inherits(Spec, EventEmitter);

Spec.prototype.runTests = function runTests() {
  this._startTime = new Date();
  var self = this;
  return Promise.all(this._tests.map(function(test) {
    return test.run().then(function() {
      self._updateTest(test);
    });
  })).then(function() {
    self._endTime = new Date();
    self.stats.duration = self._endTime - self._startTime;
    self._makeEpilogue();
//    self.emit('ended');
  });
};

Spec.prototype._updateTest = function _updateTest(test) {
  if (test.err) {
    this.stats.failures++;

    // FIXME(mroberts): ...
    test.err.stack += '\n';

    this.failures.push(test);
  } else {
    this.stats.passes++;
  }
  this._lines[this._indices.get(test)] = makeTestLine(test);
  this.emit('changed');
};

Spec.prototype._makeEpilogue = function _makeEpilogue() {
  this._lines.push('');

  // HACK(mroberts): ...
  var log = console.log;

  var self = this;
  console.log = function() {
    var args = [].slice.apply(arguments);
    var lines = util.format.apply(console, args).split('\n');
    this._lines = this._lines.concat(lines);
  }.bind(this);

  Base.prototype.epilogue.call(this);

  console.log = log;

  this.emit('changed');
};

Spec.prototype.toString = function toString() {
  return '\n\n' + this._lines.join('\n').replace(/{spinner}/g, this._spinner[0]);
};

// Helpers
// ----------------------------------------------------------------------------

function makeDescribeLine(name, i) {
  i = i || 0;
  return new Array(i + 2).join('  ') + name;
}

function makeTestLine(test) {
  var i = test._prefix.length;
  var c = 'pending';
  var x = color(c, '{spinner}');
  if (test._didFinish && test.err) {
    c = 'fail';
    x = color('fail', '✖');
  } else if (test._didFinish) {
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
    test._prefix.reduce(function(map, key, i) {
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

module.exports = Spec;
