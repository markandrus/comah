'use strict';

var doneable = require('./doneable');
var It = require('./it2');

var DEFAULT_TIMEOUT = 200;

// Test
// ============================================================================

/**
 * Construct a {@link Test}.
 * @api private
 * @class
 * @classdesc A test
 * @param {string} name
 * @param {?number} [timeout]
 * @param {LazyPromise} before
 * @param {Doneable} def
 * @param {LazyPromise} after
 */
function Test(name, timeout, before, def, after) {
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
 * Convert a value of type `Node<Describe|It>` to `Array<Test>`.
 * @api private
 * @param {Node<Describe|It>} node
 * @returns {Array<Test>}
 */
Test.tests = function tests(node) {
  return node.paths()
    .filter(function(path) {
      return path.length && path[path.length - 1]._value instanceof It;
    }).map(pathToTest);
};

/**
 * Run the {@link Test}.
 * @api private
 * @returns {Promise}
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
    self._isFinished = true;
    return;
  }, function(error) {
    self._isFinished = true;
    self.err = error;
    return error;
  });
};

// Helpers
// ----------------------------------------------------------------------------

function pathToTest(path) {
  var spec = {
    name: [],
    timeout: DEFAULT_TIMEOUT,
    before: [],
    def: null,
    after: []
  };

  path.forEach(function(node) {
    node = node._value;

    spec.name.push(node._name);

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
    spec.name.join(' '),
    spec.timeout,
    doneable.sequence.bind(null, spec.before),
    spec.def,
    doneable.sequence.bind(null, spec.after)
  );
}

module.exports = Test;
