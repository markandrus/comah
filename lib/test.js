'use strict';

var EventEmitter = require('events').EventEmitter;
var Deferred = require('./deferred');
var Describe = require('./describe');
var doneable = require('./doneable');
var inherits = require('util').inherits;
var It = require('./it');
var util = require('./util');

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
 * @param {Doneable} doneable
 * @param {LazyPromise} after
 */
function Test(prefix, name, timeout, before, doneable, after) {
  EventEmitter.call(this);

  this._prefix = prefix || [];
  this._name = name;
  this._timeout = timeout;
  this._before = before;
  this._doneable = doneable;
  this._after = after;

  this._started = false;
  this._startTime = null;
  this._finished = false;
  this._finishTime = null;
  this._duration = null;

  this.err = null;

  var self = this;
  var deferred = this._deferred = new Deferred();
  this._promise = deferred.promise.then(function() {
    self.setFinished();
    return self;
  }, function(error) {
    self.setFinished(error);
    return self;
  });
}

/**
 * Convert a {@link Node} to {@link Test}s.
 * @api private
 * @param {Node<Describe|It> node
 * @returns {Array<Test>}
 */
Test.fromNode = function fromNode(node) {
  return node.getPaths()
    .filter(function(path) {
      return path.length && path[path.length - 1].getValue() instanceof It;
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

inherits(Test, EventEmitter);

/**
 * Get the full title of the {@link Test}.
 * @api private
 * @instance
 * @returns {string}
 */
Test.prototype.fullTitle = function fullTitle() {
  return this.getPrefix().concat(this.getName()).join(' ');
};

/**
 * Get the {@link Deferred} that the {@link Test} uses to resolve or reject
 *   with an Error when running.
 * @instance
 * @returns {Deferred}
 */
Test.prototype.getDeferred = function getDeferred() {
  return this._deferred;
};

/**
 * Get the duration of the {@link Test}'s running time in milliseconds.
 * @instance
 * @returns {?number}
 */
Test.prototype.getDuration = function getDuration() {
  return this._duration;
};

/**
 * Check whether or not the {@link Test} has finished.
 * @instance
 * @returns {boolean}
 */
Test.prototype.getFinished = function getFinished() {
  return !!this.getFinishTime();
};

/**
 * Get the {@link Test}'s finished time.
 * @instance
 * @returns {?Date}
 */
Test.prototype.getFinishTime = function getFinishTime() {
  return this._finishTime;
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
 * Get the prefix of the {@link Test}.
 * @instance
 * @returns {string}
 */
Test.prototype.getPrefix = function getPrefix() {
  return this._prefix;
};

/**
 * Get the Promise that will resolve once the {@link Test} has finished
 *   running.
 * @instance
 * @returns {Promise<Test>}
 */
Test.prototype.getPromise = function getPromise() {
  return this._promise;
};

/**
 * Check whether or not the {@link Test} has started.
 * @instance
 * @returns {boolean}
 */
Test.prototype.getStarted = function getStarted() {
  return !!this.getStartTime();
};

/**
 * Get the {@link Test}'s start time.
 * @instance
 * @returns {?Date}
 */
Test.prototype.getStartTime = function getStartTime() {
  return this._startTime;
};

/**
 * Run the {@link Test}.
 * @api private
 * @instance
 * @returns {Promise<Test>}
 */
Test.prototype.run = function run() {
  if (!this.getStarted()) {
    var self = this;
    this.setStarted();
    this._before().then(function() {
      return doneable.toPromise(self._doneable.bind(self));
    }).then(function() {
      return self._after();
    }).then(function() {
      self.getDeferred().resolve();
    }, function(error) {
      self.getDeferred().reject(error);
    });
  }
  return this.getPromise();
};

/**
 * Set an Error on the {@link Test}.
 * @instance
 * @param {Error} [error]
 * @returns {Test}
 */
Test.prototype.setError = function setError(error) {
  this.err = this.err || error;
  return this;
};

/**
 * Mark the {@link Test} as finished, optionally setting an Error (and the
 *   finish time).
 * @instance
 * @param {?Error} [error]
 * @param {?Date} [finishTime]
 * @returns {Test}
 */
Test.prototype.setFinished = function setFinished(error, finishTime) {
  if (!this.getStarted()) {
    throw new Error('Test was not started');
  }
  if (this.getFinished()) {
    return this;
  }
  this._finishTime = this._finishTime || finishTime || new Date();
  this._duration = this.getDuration()
    || this.getFinishTime() - this.getStartTime();
  this._finished = true;
  if (error) {
    this.setError(error);
    this.emit('failed');
  } else {
    this.emit('passed');
  }
  this.emit('finished');
  return this;
};

/**
 * Mark the {@link Test} as started.
 * @instance
 * @returns {Test}
 */
Test.prototype.setStarted = function setStarted() {
  if (this.getStarted()) {
    throw new Error('Test already started');
  }
  this._startTime = new Date();
  this._started = true;
  this.emit('started');
  return this;
};

Test.prototype.toJSON = function toJSON() {
  var json = {};
  Object.getOwnPropertyNames(this).forEach(function(key) {
    json[key] = this[key];
  }, this);
  json.err = this.err ? util.errorToJSON(this.err) : null;
  return json;
};

// Helpers
// ----------------------------------------------------------------------------

function toTest(path) {
  var spec = {
    prefix: [],
    name: null,
    timeout: null,
    before: [],
    doneable: null,
    after: []
  };

  path.forEach(function(node) {
    node = node._value;

    if (node instanceof It) {
      spec.name = node.getName();
    } else {
      spec.prefix.push(node.getName());
    }

    var timeout = node.getTimeout();
    if (timeout !== null) {
      spec.timeout = timeout;
    }

    var beforeEach = node instanceof Describe && node.getBeforeEach();
    if (beforeEach) {
      spec.before = spec.before.concat(beforeEach);
    }

    if (node instanceof It) {
      spec.doneable = node.getDef();
    }

    var afterEach = node instanceof Describe && node.getAfterEach();
    if (afterEach) {
      spec.after = spec.after.concat(afterEach);
    }
  });

  return new Test(
    spec.prefix,
    spec.name,
    spec.timeout,
    doneable.sequence.bind(null, spec.before),
    spec.doneable,
    doneable.sequence.bind(null, spec.after)
  );
}

module.exports = Test;
