'use strict';

/**
 * Construct a {@link Node}.
 * @class
 * @classdesc A {@link Node} is a node in the abstract syntax tree (AST) that
 * defines our tests.
 * @param {?Array<string>} prefix - the prefix to the name of this {@link Node}
 * @param {string} name - the name of this {@link Node}
 * @param {?body} function - the function which defines this {@link Node} (for
 *   {@link Describe}s, this is invoked immediately; for {@link It}s, it is
 *   invoked during testing)
 * @param {number=} timeout - the maximum amount of time to run any test
 *   defined by this {@link Node} (inherited from the parent {@link Node}
 *   unless overridden)
 */
function Node(prefix, name, body, timeout) {
  prefix = prefix || [];
  body = body || null;
  Object.defineProperties(this, {
    _body: {
      enumerable: true,
      get: function() {
        return body;
      },
      set: function(_body) {
        body = _body;
      }
    },
    _name: {
      enumerable: true,
      value: name
    },
    _prefix: {
      enumerable: true,
      value: prefix
    },
    _timeout: {
      enumerable: true,
      get: function() {
        return timeout;
      },
      set: function(_timeout) {
        timeout = _timeout;
      }
    }
  });
}

/**
 * Get the tests described by this {@link Node}.
 * @instance
 * @private
 * @param {?Array<string>} prefix - the test name prefix
 * @param {?Array<function>} before - the functions to run before the test
 * @param {?Array<function>} after - the functions to run after the test (if
 * @param {number=} timeout - the maximum amount of time to run the tests
 *   if not specified (defaults to 200 milliseconds)
 * @returns Array<Test>
 */
Node.prototype._getTests = function _getTests() {
  throw new Error('Node#_getTests must be implemented');
};

/**
 * Set the {@link Node}'s timeout. A falsy value disables the timeout.
 * @instance
 * @param {?timeout} timeout
 * @returns Node
 */
Node.prototype.timeout = function timeout(_timeout) {
  _timeout = _timeout || 0;
  this._timeout = _timeout;
  return this;
};

module.exports = Node;
