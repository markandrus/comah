'use strict';

var Base = require('mocha/lib/reporters/base');
var Describe = require('../describe');
var EventEmitter = require('events').EventEmitter;
var It = require('../it');
var util = require('util');

function Spec(node) {
  EventEmitter.call(this);
  var tests = node ? node._getTests() : [];
  var nodes = node ? flatten(node) : [];
  var lines = new Array(nodes.length);
  var spinnerIndex = 0;
  var promise = null;
  Object.defineProperties(this, {
    _lines: {
      enumerable: true,
      get: function() {
        return lines;
      },
      set: function(_lines) {
        lines = _lines;
      }
    },
    _nodes: {
      enumerable: true,
      value: nodes
    },
    _promise: {
      enumerable: true,
      get: function() {
        return promise;
      },
      set: function(_promise) {
        promise = _promise;
      }
    },
    _spinnerIndex: {
      enumerable: true,
      get: function() {
        return spinnerIndex;
      },
      set: function(_spinnerIndex) {
        spinnerIndex = _spinnerIndex;
      }
    },
    _tests: {
      enumerable: true,
      value: tests
    },
    failures: {
      enumerable: true,
      value: []
    },
    passes: {
      enumerable: true,
      value: []
    },
    stats: {
      enumerable: true,
      value: {
        duration: 0,
        failures: 0,
        passes: 0,
        pending: 0
      }
    }
  });
}

util.inherits(Spec, EventEmitter);

Spec.prototype.refresh = function refresh() {
  this._spinnerIndex = (this._spinnerIndex + 1) % 8;
  this.emit('changed');
  return this;
}

Spec.prototype.start = function start() {
  if (!this._promise) {
    var startTime = Date.now();
    this._promise = Promise.all(this._nodes.map(function(node, i) {
      if (node instanceof Describe) {
        this._lines[i] = node.toString();
      } else if (node instanceof It) {
        var test = node._test;
        this._lines[i] = test.toString();
        return test.start().then(function(test) {
          if (test.err) {
            this.failures.push(test);
            this.stats.failures++;
            test._failureNumber = this.stats.failures;
            this._lines[i] = test.toString();
          } else {
            this.passes.push(test);
            this.stats.passes++;
            this._lines[i] = test.toString();
          }
          this.emit('changed');
        }.bind(this));
      }
    }.bind(this))).then(function() {
      var endTime = Date.now();
      this.stats.duration = endTime - startTime;

      this._lines.push('');

      // HACK(mroberts): OMG...
      var log = console.log;
      console.log = function() {
        var args = [].slice.apply(arguments);
        var lines = util.format.apply(console, args).split('\n');
        this._lines = this._lines.concat(lines);
      }.bind(this);
      Base.prototype.epilogue.call(this);
      console.log = log;

      this.emit('changed');
    }.bind(this));
  }
  return this._promise;
};

Spec.prototype.toString = function toString() {
  return '\n\n' + this._lines.join('\n').replace(/{spinner}/g, spinner(this._spinnerIndex));
};

function spinner(i) {
  return ['\\', '|', '/', '-', '\\', '|', '/', '-'][i || 0];
}

function flatten(node, nodes) {
  nodes = nodes || [];
  nodes.push(node);
  if (node._children) {
    node._children.forEach(function(node) {
      if (node instanceof Describe) {
        flatten(node, nodes);
      } else if (node instanceof It) {
        nodes.push(node);
      }
    });
  }
  return nodes;
}

module.exports = Spec;
