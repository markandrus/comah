'use strict';

var doneable = require('./doneable');
var It = require('./it');

// Test
// ============================================================================

/**
 * Construct a {@link Test}.
 * @api private
 * @class
 * @classdesc A test
 * @param {?Array<String>} [prefix=[]]
 * @param {string} name
 * @param {?number} [timeout]
 * @param {LazyPromise} before
 * @param {Doneable} def
 * @param {LazyPromise} after
 */
function Test(prefix, name, timeout, before, def, after) {
  this._prefix = prefix || [];
  this._name = name;
  this._timeout = timeout;
  this._before = before;
  this._def = def;
  this._after = after;

  this._promise = null;
  this._didRun = false;
  this._didFinish = false;

  this.err = null;
}

/**
 * Convert a {@link Node} to {@link Test}s.
 * @api private
 * @param {Node<Describe|It> node
 * @returns {Array<Test>}
 */
Test.fromNode = function fromNode(node) {
  return node.paths()
    .filter(function(path) {
      return path.length && path[path.length - 1]._value instanceof It;
    }).map(toTest);
};

/**
 * Convert {@link Node}s to {@link Test}s.
 * @api private
 * @param {?Array<Node<Describe|It>>} [nodes]
 * @returns {Array<Test>}
 */
Test.fromNodes = function fromNodes(nodes) {
  nodes = nodes || [];
  return nodes.reduce(function(tests, node) {
    return tests.concat(Test.fromNode(node));
  }, []);
};

/**
 * Get the full title of the {@link Test}.
 * @api private
 * @instance
 * @returns {string}
 */
Test.prototype.fullTitle = function fullTitle() {
  return this._prefix.concat(this._name).join(' ');
};

/**
 * Get the name of the {@link Test}.
 * @api private
 * @instance
 * @returns {string}
 */
Test.prototype.getName = function getName() {
  return this._name;
};

/**
 * Run the {@link Test}.
 * @api private
 * @instance
 * @returns {Promise<Test>}
 */
Test.prototype.run = function run() {
  if (this._didRun) {
    return this._promise;
  }
  this._didRun = true;
  var self = this;
  return this._promise = this._before().then(function() {
    return doneable.toPromise(self._def.bind(self));
  }).then(function() {
    return self._after();
  }).then(function() {
    self._didFinish = true;
    return self;
  }, function(error) {
    self._didFinish = true;
    self.err = error;
    return self;
  });
};

// Helpers
// ----------------------------------------------------------------------------

function toTest(path) {
  var spec = {
    prefix: [],
    name: null,
    timeout: null,
    before: [],
    def: null,
    after: []
  };

  path.forEach(function(node) {
    node = node._value;

    if (node instanceof It) {
      spec.name = node._name;
    } else {
      spec.prefix.push(node._name);
    }

    if (node._timeout !== null) {
      spec.timeout = node._timeout;
    }

    if (node._beforeEach) {
      spec.before.push(node._beforeEach);
    }

    if (node instanceof It) {
      spec.def = node._def;
    }

    if (node._afterEach) {
      spec.after.push(node._afterEach);
    }
  });

  return new Test(
    spec.prefix,
    spec.name,
    spec.timeout,
    doneable.sequence.bind(null, spec.before),
    spec.def,
    doneable.sequence.bind(null, spec.after)
  );
}

module.exports = Test;
