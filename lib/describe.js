'use strict';

var It = require('./it');
var Node = require('./node');
var util = require('util');

/**
 * Construct a {@link Describe}.
 * @class
 * @classdesc A {@link Describe} defines zero or more tests.
 * @extends Node
 * @param {?Array<string>} prefix - the prefix to the name of this
 *   {@link Describe}
 * @param {string} name - the name of this {@link Describe}
 * @param {?function} body - the function which defines the child {@link Node}s
 *   of the {@link Describe}
 * @param {number=} timeout - the maximum amount of time to run any test
 *   defined by this {@link Describe} (inherited from the parent {@link Node}
 *   unless overridden)
 */
function Describe(prefix, name, body, timeout) {
  Node.call(this, prefix, name, body, timeout);
  var after = null;
  var before = null;
  Object.defineProperties(this, {
    _after: {
      enumerable: true,
      get: function() {
        return after;
      },
      set: function(_after) {
        after = _after;
      }
    },
    before: {
      enumerable: true,
      get: function() {
        return before;
      },
      set: function(before) {
        before = before;
      }
    },
    _children: {
      enumerable: true,
      value: []
    }
  });
}

/* Here's a little hack for Mocha/Jasmine-style calls to `describe`, `it`,
   `beforeEach`, etc.: keep a path to the Node we are working in. */

var currentPath = [];

function focus(node) {
  currentPath.unshift(node);
}

function unfocus() {
  currentPath.shift();
}

function getFocus() {
  return currentPath[0] || null;
}

/**
 * Construct a {@link Describe} and invoke its body function.
 * @param {string} name - the name of the {@link Describe}
 * @param {function} body - the function which defines the child {@link Node}s
 *   of the {@link Describe}
 * @returns Describe
 */
Describe.describe = function describe(name, body) {
  var describe = getFocus();
  if (describe) {
    return describe.describe(name, body);
  }
  describe = new Describe(null, name, body);
  focus(describe);
  describe._body.bind(describe)();
  return describe;
};

Describe.after = Describe.afterEach;

Describe.afterEach = function afterEach(body) {
  var describe = getFocus();
  if (!describe) {
    throw new Error('You must call describe first');
  }
  return describe.afterEach(body);
};

Describe.before = Describe.beforeEach;

Describe.beforeEach = function beforeEach(body) {
  var describe = getFocus();
  if (!describe) {
    throw new Error('You must call describe first');
  }
  return describe.beforeEach(body);
};

Describe.it = function it(name, body) {
  var describe = getFocus();
  if (!describe) {
    throw new Error('You must call describe first');
  }
  return describe.it(name, body);
};

Describe.timeout = function timeout(_timeout) {
  var describe = getFocus();
  if (!describe) {
    throw new Error('You must call describe first');
  }
  return describe.timeout(_timeout);
};

util.inherits(Describe, Node);

/**
 * Get the zero or more tests defined by this {@link Describe}.
 * @instance
 * @private
 * @param {?string} prefix - the test name prefix
 * @param {?Array<function>} before - the functions to run before the test
 * @param {?Array<function>} after - the functions to run after the test (if
 *   successful)
 * @param {number=} timeout - the maximum amount of time to run the tests
 *   if not specified (defaults to 200 milliseconds)
 * @returns Array<Test>
 */
Describe.prototype._getTests = function _getTests(prefix, before, after,
  timeout)
{
  prefix = prefix || [];
  before = before || [];
  after = after || [];

  prefix = prefix.concat([this._name]);
  before = this._before ? before.slice().concat([this._before]) : before;
  after = this._after ? after.slice().concat([this._after]) : after;
  timeout = this._timeout || timeout;

  var tests = [];
  return this._children.reduce(function(tests, node) {
    return tests.concat(node._getTests(prefix, before, after, timeout));
  }.bind(this), []);
};

Describe.prototype.after = Describe.prototype.afterEach;

Describe.prototype.afterEach = function afterEach(body) {
  if (this._after) {
    throw new Error('You may only call Describe#afterEach once');
  }
  this._after = body;
  return this;
};

Describe.prototype.before = Describe.prototype.beforeEach;

Describe.prototype.beforeEach = function beforeEach(body) {
  if (this.before) {
    throw new Error('You may only call Describe#beforeEach once');
  }
  this._before = body;
  return this;
};

/**
 * Construct a child {@link Describe} and invoke its body function. Returns the
 * parent {@link Describe}.
 * @instance
 * @param {string} name - the name of the {@link Describe}
 * @param {function} body - the function which defines the child {@link Node}s
 *   of the {@link Describe}
 * @returns Describe
 */
Describe.prototype.describe = function describe(name, body) {
  var prefix = this._prefix.concat([this._name]);
  var describe = new Describe(prefix, name, body);
  this._children.push(describe);
  focus(describe);
  describe._body.bind(describe)();
  unfocus();
  return this;
};

/**
 * Construct a child {@link It}.
 * @instance
 * @param {string} name - the name of the {@link It}
 * @param {function} body - the function which defines the child {@link Node}s
 *   of the {@link Describe}
 * @returns Describe
 */
Describe.prototype.it = function it(name, body) {
  var prefix = this._prefix.concat([this._name]);
  var it = new It(prefix, name, body);
  this._children.push(it);
  return this;
};

Describe.prototype.toString = function toString() {
  return new Array(this._prefix.length + 2).join('  ') + this._name;
};

module.exports = Describe;
