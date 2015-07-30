'use strict';

var Describe = require('./describe2');
var It = require('./it2');
var Node = require('./node2');

// Domain-Specific Language (DSL)
// ============================================================================

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

  return oldNode || newNode;
}

/**
 * Describe a unit of functionality to be tested.
 * @api public
 * @param {string} name
 * @param {function} def
 * @returns {Node}
 */
function it(name, def) {
  var oldNode = focus();
  if (!oldNode) {
    throw new Error('`it` must be called inside `describe`');
  }

  var it = new It(name, def);
  var newNode = Node.of(it);
  oldNode = oldNode.insertRight(newNode);
  refocus(oldNode);

  return focus();
}

/**
 * Specify a function to run before each test within the current `describe`
 *   (same as `beforeEach`).
 * @api public
 * @param {function} def
 * @returns {Node}
 */
var before = beforeEach;

/**
 * Specify a function to run before each test within the current `describe`.
 * @api public
 * @param {function} def
 * @returns {Node}
 */
function beforeEach(def) {
  var node = focus();
  var describe = null;
  if (node && (describe = node.extract()) instanceof Describe) {
    return refocus(new Node(describe.beforeEach(def), node._children));
  }
  throw new Error('`beforeEach` must be called inside `describe`');
}

/**
 * Specify a function to run after each test within the current `describe`
 * (same as `afterEach`).
 * @api public
 * @param {function} def
 * @returns {Node}
 */
var after = afterEach;

/**
 * Specify a function to run after each test within the current `describe`.
 * @api public
 * @param {function} def
 * @returns {Node}
 */
function afterEach(def) {
  var node = focus();
  var describe = null;
  if (node && (describe = node.extract()) instanceof Describe) {
    return refocus(new Node(describe.afterEach(def), node._children));
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

function print(a) {
  console.log(JSON.stringify(a));
}

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

module.exports.topLevelDescribes = topLevelDescribes;
module.exports.describe = describe;
module.exports.it = it;
module.exports.before = before;
module.exports.beforeEach = beforeEach;
module.exports.after = after;
module.exports.afterEach = afterEach;
module.exports.timeout = timeout;
