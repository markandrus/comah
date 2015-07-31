'use strict';

var Describe = require('./describe');
var It = require('./it');
var Node = require('./node');

// Domain-Specific Language (DSL)
// ============================================================================

function DSL() {
  global.describe = describe;
  global.it = it;
  global.before = before;
  global.beforeEach = beforeEach;
  global.after = after;
  global.afterEach = afterEach;
  global.timeout = timeout;
  return DSL;
};

/**
 * Describe units of functionality to test.
 * @api public
 * @param {string} name
 * @param {function} def
 * returns {Node}
 */
function describe(name, def) {
  var oldNode = focus();
  var describe = new Describe(name, def);
  var newNode = Node.of(describe);

  focus(newNode);
  describe.run();
  newNode = unfocus();

  if (oldNode) {
    oldNode = oldNode.insertRight(newNode);
    refocus(oldNode);
  }

  if (!path.length) {
    topLevelDescribes.push(oldNode || newNode);
  }

  return oldNode || newNode;
}

/**
 * Describe a unit of functionality to be tested.
 * @api public
 * @param {string} name
 * @param {Doneable} doneable
 * @returns {Node}
 */
function it(name, doneable) {
  var oldNode = focus();
  if (!oldNode) {
    throw new Error('`it` must be called inside `describe`');
  }

  var it = new It(name, doneable);
  var newNode = Node.of(it);
  oldNode = oldNode.insertRight(newNode);
  refocus(oldNode);

  return focus();
}

/**
 * Specify a function to run before each test within the current `describe`
 *   (same as `beforeEach`).
 * @api public
 * @param {Doneable} doneable
 * @returns {Node}
 */
var before = beforeEach;

/**
 * Specify a function to run before each test within the current `describe`.
 * @api public
 * @param {Doneable} doneable
 * @returns {Node}
 */
function beforeEach(doneable) {
  var node = focus();
  var describe = null;
  if (node && (describe = node.extract()) instanceof Describe) {
    return refocus(new Node(describe.beforeEach(doneable), node._children));
  }
  throw new Error('`beforeEach` must be called inside `describe`');
}

/**
 * Specify a function to run after each test within the current `describe`
 * (same as `afterEach`).
 * @api public
 * @param {Doneable} doneable
 * @returns {Node}
 */
var after = afterEach;

/**
 * Specify a function to run after each test within the current `describe`.
 * @api public
 * @param {Doneable} doneable
 * @returns {Node}
 */
function afterEach(doneable) {
  var node = focus();
  var describe = null;
  if (node && (describe = node.extract()) instanceof Describe) {
    return refocus(new Node(describe.afterEach(doneable), node._children));
  }
  throw new Error('`afterEach` must be called in inside `describe`');
}

/**
 * Specify the timeout of the current `describe` or `it` (cascades
 *   down to other `describe`s and `it`s).
 * @api public
 * @param {number} [milliseconds]
 * @returns {Node}
 */
function timeout(milliseconds) {
  var node = focus();
  if (node) {
    return refocus(new Node(node.extract().timeout(milliseconds),
      node._children));
  }
  throw new Error('`timeout` must be called inside `describe` or `it`');
}

// Helpers
// ----------------------------------------------------------------------------

var path = [];
var topLevelDescribes = [];

function focus(node) {
  if (node) {
    path.unshift(node);
    return node;
  }
  return path[0];
}

function unfocus() {
  return path.shift();
}

function refocus(node) {
  path[0] = node;
  return node;
}

module.exports = DSL;
module.exports.topLevelDescribes = topLevelDescribes;
module.exports.describe = describe;
module.exports.it = it;
module.exports.before = before;
module.exports.beforeEach = beforeEach;
module.exports.after = after;
module.exports.afterEach = afterEach;
module.exports.timeout = timeout;
