'use strict';

var doneable = require('./doneable');
var Node = require('./node');
var Test = require('./test');
var util = require('util');

/**
 * Construct an {@link It}.
 * @class
 * @classdesc An {@link It} defines a single test.
 * @extends Node
 * @param {?Array<string>} prefix - the prefix to the name of this {@link It}
 * @param {string} name - the name of the {@link It}
 * @param {function} body - the test function
 * @param {number=} timeout - the maximum amount of time to run the test
 *   defined by this {@link It} (inherited from the parent {@link Node}
 *   unless overridden)
 */
function It(prefix, name, body, timeout) {
  Node.call(this, prefix, name, body, timeout);
  var test = null;
  Object.defineProperties(this, {
    _test: {
      enumerable: true,
      get: function() {
        return test;
      },
      set: function(_test) {
        test = _test;
      }
    }
  });
}

util.inherits(It, Node);

/**
 * Get the single test defined by this {@link It}.
 * @instance
 * @param {?Array<string>} prefix - the test name prefix
 * @param {?Array<function>} before - the functions to run before the test
 * @param {?Array<function>} after - the functions to run after the test (if
 *   successful)
 * @param {number=} timeout - the maximum amount of time to run the test
 *   if not specified (defaults to 200 milliseconds)
 * @returns Array<Test>
 */
It.prototype._getTests = function _getTests(prefix, before, after, timeout) {
  prefix = prefix || [];
  before = before || [];
  after = after || [];
  timeout = this._timeout || timeout;

  var self = this;

  function lazyPromise() {
    return doneable.sequence(before).then(function() {
      return doneable.toPromise(self._body.bind(self));
    }).then(function() {
      return doneable.sequence(after);
    }).then(function() {
      return;
    }, function(error) {
      return error;
    });
  }

  var test = new Test(prefix, this._name, lazyPromise);
  this._test = test;
  return [test];
};

module.exports = It;
