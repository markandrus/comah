'use strict';

var array = require('./array');
var util = require('./util');

// Rose Tree
// ============================================================================

/**
 * Construct a {@link Node}.
 * @api private
 * @class
 * @classdesc A single {@link Node} in a rose tree
 * @implements Setoid
 * @implements Semigroup
 * @implements Monoid1
 * @implements Functor
 * @implements Apply
 * @implements Applicative
 * @implements Foldable
 * @implements Traversable
 * @implements Chain
 * @implements Monad
 * @implements Extend
 * @implements Comonad
 * @param {*} value
 * @param {Array<Node>} [children]
 */
function Node(value, children) {
  this._value = value;
  this._children = children || [];
}

/**
 * Insert a {@link Node} to the left of the children.
 * @api private
 * @instance
 * @param {Node} node
 * @returns {Node}
 */
Node.prototype.insertLeft = function insertLeft(node) {
  return new Node(this.getValue(), [node].concat(this.getChildren()));
};

/**
 * Insert a {@link Node} to the right of the children.
 * @api private
 * @instance
 * @param {Node} node
 * @returns {Node}
 */
Node.prototype.insertRight = function insertRight(node) {
  return new Node(this.getValue(), this.getChildren().concat([node]));
};

/**
 * Get the children of this {@link Node}.
 * @instance
 * @returns {Array<Node>}
 */
Node.prototype.getChildren = function getChildren() {
  return this._children;
};

/**
 * Get the paths from this {@link Node} to its leaf {@link Node}s.
 * @api private
 * @instance
 * @returns {Array<Array<Node>>}
 */
Node.prototype.getPaths = function getPaths() {
  var children = this.getChildren();
  if (!children.length) {
    return [this];
  }
  var self = this;
  return array.join(children.map(function(node) {
    return node.getPaths();
  })).map(function(path) {
    return [self].concat(path);
  });
};

/**
 * Get the value contained by this {@link Node}.
 * @instance
 * @returns {*}
 */
Node.prototype.getValue = function getValue() {
  return this._value;
};

// Setoid
// ----------------------------------------------------------------------------

Node.prototype.equals = function equals(b) {
  return valueEquals(this.getValue(), b.getValue())
    && array.equals(this.getChildren(), b.getChildren());
};

// Semigroup
// ----------------------------------------------------------------------------

Node.prototype.concat = function concat(b) {
  return new Node(this.getValue().concat(b),
    this.getChildren().concat(b.getChildren()));
};

// Monoid1
// ----------------------------------------------------------------------------

Node.empty1 = function empty1(empty) {
  return new Node(empty());
};

// Functor
// ----------------------------------------------------------------------------

Node.prototype.map = function map(f) {
  return new Node(f(this.getValue()), this.getChildren().map(function(node) {
    return node.map(f);
  }));
};

// Apply
// ----------------------------------------------------------------------------

Node.prototype.ap = function ap(b) {
  return new Node(
    this.getValue()(b.getValue()),
    this.getChildren().map(function(node) {
      return node.ap(b);
    })
  );
};

// Applicative
// ----------------------------------------------------------------------------

Node.of = function of(value) {
  return new Node(value);
};

// Foldable
// ----------------------------------------------------------------------------

Node.prototype.reduce = function reduce(f, x) {
  return this.getChildren().reduce(function(x, node) {
    return node.reduce(f, x);
  }, f(this.getValue(), x));
};

// Traversable
// ----------------------------------------------------------------------------

Node.prototype.traverse = function traverse(f, of) {
  return ap(f(this.getValue()).map(function(value) {
    return function(children) {
      return new Node(value, children);
    };
  }), array.traverse(this.getChildren(), function(node) {
    return node.traverse(f, of);
  }, of));
};

Node.prototype.sequence = function sequence(of) {
  return this.traverse(util.id, of);
};

// Chain
// ----------------------------------------------------------------------------

Node.prototype.chain = function chain(f) {
  var oldValue = this.getValue();
  var oldChildren = this.getChildren();
  var newNode = f(oldValue);
  var newValue = newNode.getValue();
  var newChildren = newNode.getChildren();
  return new Node(newValue, newChildren.concat(oldChildren.map(function(node) {
    return node.chain(f);
  })));
};

// Monad
// ----------------------------------------------------------------------------

Node.prototype.join = function join() {
  return this.chain(util.id);
};

// Extend
// ----------------------------------------------------------------------------

Node.prototype.extend = function extend(f) {
  return new Node(f(this), this.getChildren().map(function(node) {
    return node.extend(f);
  }));
};

// Comonad
// ----------------------------------------------------------------------------

Node.prototype.extract = Node.prototype.getValue;

// Helpers
// ----------------------------------------------------------------------------

function ap(x, y) {
  if (x.constructor === Array) {
    return array.ap(x, y);
  }
  return x.ap(y);
}

module.exports = Node;
