'use strict';

var util = require('util');

// Node
// ============================================================================

function Node() {
}

function Branch(nodes) {
  Node.call(this);
  this._nodes = nodes || [];
}

util.inherits(Branch, Node);

function Leaf(value) {
  Node.call(this);
  value = value || null;
  this._value = value;
}

util.inherits(Leaf, Node);

function branch(nodes) {
  return new Branch(nodes);
}

function leaf(value) {
  return new Leaf(value);
}

// Functor
// ----------------------------------------------------------------------------

Branch.prototype.map = function map(f) {
  return new Branch(this._nodes.map(function(node) {
    return node.map(f);
  }));
};

Leaf.prototype.map = function map(f) {
  return new Leaf(f(this._value));
};

// Apply
// ----------------------------------------------------------------------------

Branch.prototype.ap = function ap(b) {
  return new Branch(this._nodes.map(function(node) {
    return node.ap(b);
  }));
};

Leaf.prototype.ap = function ap(b) {
  return new Leaf(this._value(b._value));
};

// Applicative
// ----------------------------------------------------------------------------

Node.of = Branch.of = Leaf.of = leaf;

// Foldable
// ----------------------------------------------------------------------------

Branch.prototype.reduce = function reduce(f, x) {
  return this._nodes.reduce(function(x, node) {
    return node.reduce(f, x);
  }, x);
};

Leaf.prototype.reduce = function reduce(f, x) {
  return f(this._value, x);
};

// Traversable
// ----------------------------------------------------------------------------

Branch.prototype.traverse = function traverse(f, of) {
  return sequenceArray(this._nodes.map(function(node) {
    return node.traverse(f, of);
  }), of).map(branch);
};

Leaf.prototype.traverse = function traverse(f) {
  return f(this._value).map(leaf);
};

Branch.prototype.sequence = function sequence(of) {
  return this.traverse(id, of);
};

Leaf.prototype.sequence = function sequence() {
  return this._value.map(leaf);
};

// Chain
// ----------------------------------------------------------------------------

Branch.prototype.chain = function chain(f) {
  return new Branch(this._nodes.map(function(node) {
    return node.chain(f);
  }));
};

Leaf.prototype.chain = function chain(f) {
  return f(this._value);
};

// Helpers
// ============================================================================

function id(a) {
  return a;
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

function sequenceArray(as, of) {
  return traverseArray(id, as, of);
}

module.exports.branch = branch;
module.exports.leaf = leaf;
