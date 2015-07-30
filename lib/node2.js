'use strict';

var util = require('util');

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
  return new Node(this._value, [node].concat(this._children));
};

/**
 * Insert a {@link Node} to the right of the children.
 * @api private
 * @instance
 * @param {Node} node
 * @returns {Node}
 */
Node.prototype.insertRight = function insertRight(node) {
  return new Node(this._value, this._children.concat([node]));
};

/**
 * Get paths from this {@link Node} to its leaf {@link Node}s.
 * @api private
 * @instance
 * @returns {Array<Array<Node>>}
 */
Node.prototype.paths = function paths() {
  if (!this._children.length) {
    return [this];
  }
  return flatten(this._children.map(function(node) {
    return node.paths();
  })).map(function(path) {
    return [this].concat(path);
  }.bind(this));
};

function flatten(xss) {
  return xss.reduce(function(ys, xs) {
    return ys.concat(xs);
  }, []);
}

// Setoid
// ----------------------------------------------------------------------------

Node.prototype.equals = function equals(b) {
  if (!defaultEquals(this._value, b._value)) {
    return false;
  }
  if (this._children.length !== b._children.length) {
    return false;
  }
  for (var i = 0; i < this._children.length; i++) {
    for (var j = 0; j < b._children.length; j++) {
      if (!defaultEquals(this._children[i], this._children[j])) {
        return false;
      }
    }
  }
  return true;
};

// Semigroup
// ----------------------------------------------------------------------------

Node.prototype.concat = function concat(b) {
  return new Node(this._value.concat(b), this._children.concat(b._children));
};

// Monoid1
// ----------------------------------------------------------------------------

Node.empty1 = function empty1(empty) {
  return new Node(empty());
};

// Functor
// ----------------------------------------------------------------------------

Node.prototype.map = function map(f) {
  return new Node(f(this._value), this._children.map(function(node) {
    return node.map(f);
  }));
};

// Apply
// ----------------------------------------------------------------------------

Node.prototype.ap = function ap(b) {
  return new Node(this._value(b._value), this._children.map(function(node) {
    return node.ap(b);
  }));
};

// Applicative
// ----------------------------------------------------------------------------

Node.of = function of(value) {
  return new Node(value);
};

// Foldable
// ----------------------------------------------------------------------------

Node.prototype.reduce = function reduce(f, x) {
  return this._children.reduce(function(x, node) {
    return node.reduce(f, x);
  }, f(this._value, x));
};

// Traversable
// ----------------------------------------------------------------------------

Node.prototype.traverse = function traverse(f, of) {
  return ap(f(this._value).map(function(value) {
    return function(children) {
      return new Node(value, children);
    };
  }), traverseArray(function(node) {
    return node.traverse(f, of);
  }, this._children, of));
};

Node.prototype.sequence = function sequence(of) {
  return this.traverse(id, of);
};

// Chain
// ----------------------------------------------------------------------------

Node.prototype.chain = function chain(f) {
  var oldValue = this._value;
  var oldChildren = this._children;
  var newNode = f(oldValue);
  var newValue = newNode._value;
  var newChildren = newNode._children;
  return new Node(newValue, newChildren.concat(oldChildren.map(function(node) {
    return node.chain(f);
  })));
};

// Extend
// ----------------------------------------------------------------------------

Node.prototype.extend = function extend(f) {
  return new Node(f(this), this._children);
};

// Comonad
// ----------------------------------------------------------------------------

Node.prototype.extract = function extract() {
  return this._value;
};

// Helpers
// ----------------------------------------------------------------------------

function defaultEquals(a, b) {
  if (typeof a.equals === 'function') {
    return a.equals(b);
  }
  return a === b;
}

function ap(x, y) {
  if (x.constructor === Array) {
    return apArray(x, y);
  }
  return x.ap(y);
}

function apArray(fs, xs) {
  var ys = [];
  fs.forEach(function(f) {
    xs.forEach(function(x) {
      ys.push(f(x));
    });
  });
  return ys;
}

function cons(f, ys, x) {
  return ap(f(x).map(function(a) {
    return function(bs) {
      return [a].concat(bs);
    };
  }), ys);
}

function traverseArray(f, as, of) {
  var consF = cons.bind(null, f);
  return as.reduceRight(consF, of([]));
}

function id(a) {
  return a;
}

function sequenceArray(as, of) {
  return traverseArray(id, as, of);
}

module.exports = Node;
