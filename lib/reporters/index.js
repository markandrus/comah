'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

// Reporter
// ============================================================================

function Reporter(tests) {
  EventEmitter.call(this);

  this._tests = tests || [];

  this._startTime = null;
  this._endTime = null;

  this.failures = [];
  var stats = this.stats = {
    duration: 0,
    failures: 0,
    passes: 0,
    pending: 0
  };

  var self = this;

  var promises = tests.map(function(test) {
    test.once('started', function() {
      self._startTime = self._startTime || new Date();
      self.emit('testStarted', test);
    });

    test.once('failed', function() {
      self.failures.push(test);
      self.stats.failures++;
      self.emit('testFailed', test);
    });

    test.once('passed', function() {
      self.stats.passes++;
      self.emit('testPassed', test);
    });

    test.once('finished', function() {
      self.emit('testFinished', test);
    });

    return test.getPromise();
  });

  Promise.all(promises).then(function(tests) {
    var endTime = self._endTime = new Date();
    stats.duration = endTime - self._startTime;
    self.emit('testsFinished', tests);
  });
}

Reporter.NEEDS_UI = false;

inherits(Reporter, EventEmitter);

module.exports = Reporter;
