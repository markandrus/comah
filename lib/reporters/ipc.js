'use strict';

var inherits = require('util').inherits;
var Reporter = require('./');

// IPCReporter
// ============================================================================

/**
 * Construct an {@link IPCReporter}.
 * @class
 * @classdesc A {@link Reporter} that uses inter-process communication (IPC) to
 *   report results to a parent process
 * @param {?Array<Test>} [tests]
 */
function IPCReporter(tests) {
  if (typeof process.send !== 'function') {
    throw new Error('Inter-Process Communication (IPC) is not supported on this process');
  }
  Reporter.call(this, tests);
}

inherits(IPCReporter, Reporter);

/**
 * Emit an event and send a message to the parent process.
 * @instance
 * @param {string} event
 * @param {*} [value]
 * @returns {boolean}
 */
IPCReporter.prototype.emit = function emit(event, value) {
  var ret = Reporter.prototype.emit.call(this, event, value);
  process.send({
    event: event,
    value: value
  });
  return ret;
};

module.exports = IPCReporter;
