'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DEFAULT_TIMEOUT = 200;

// Abstract Syntax Tree for Defining Tests
// ----------------------------------------------------------------------------

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

/**
 * Construct a {@link Test}.
 * @class
 * @classdesc A {@link Test} is a function which performs a test and has a
 *   name.
 * @param {?Array<string>} prefix - the prefix to the name of this {@link Test}
 * @param {string} name - the name of this {@link Test}
 * @param {function} lazyPromise - a function which returns a Promise
 */
function Test(prefix, name, lazyPromise) {
  prefix = prefix || null;
  var err = null;
  var failureNumber = null;
  var isFinished = false;
  var promise = null;
  Object.defineProperties(this, {
    _err: {
      enumerable: true,
      set: function(_err) {
        err = _err;
      }
    },
    _failureNumber: {
      enumerable: true,
      get: function() {
        return failureNumber;
      },
      set: function(_failureNumber) {
        failureNumber = _failureNumber;
      }
    },
    _fullTitle: {
      enumerable: true,
      value: prefix.concat([name]).join(' ')
    },
    _isFinished: {
      enumerable: true,
      set: function(_isFinished) {
        isFinished = _isFinished;
      }
    },
    _lazyPromise: {
      enumerable: true,
      value: lazyPromise
    },
    _name: {
      enumerable: true,
      value: name
    },
    _prefix: {
      enumerable: true,
      value: prefix
    },
    _promise: {
      enumerable: true,
      get: function() {
        return promise;
      },
      set: function(_promise) {
        promise = _promise;
      }
    },
    err: {
      enumerable: true,
      get: function() {
        return err;
      }
    },
    isFinished: {
      enumerable: true,
      get: function() {
        return isFinished;
      }
    }
  });
}

Test.prototype.fullTitle = function fullTitle() {
  return this._fullTitle;
};

/**
 * Start the {@link Test} by constructing the Promise.
 * @instance
 * @returns Promise<Error>
 */
Test.prototype.start = function start() {
  if (!this.promise) {
    this._promise = this._lazyPromise().then(function(err) {
      var passed = err === undefined;
      if (!passed) {
        if (!(err instanceof Error || err && typeof err.message === 'string')) {
          err = new Error('the ' + type(err) + ' ' + stringify(err) + ' was thrown, throw an Error :)');
        }
        this._err = err;
      }
      this._isFinished = true;
      return this;
    }.bind(this));
  }
  return this._promise;
};

Test.prototype.toString = function toString() {
  var str = '  ' + new Array(this._prefix.length).join('  ');
  if (this.isFinished && !this.err) {
    // str += color('checkmark', '  ' + Base.symbols.ok) +
    str += color('checkmark', '  ✓')
         + color('pass', ' ' + this._name);
  } else if (this.isFinished) {
    str += color('fail', '  ' + this._failureNumber + ') ' + this._name);
  } else {
    str += color('pending', '  - ' + this._name);
  }
  return str;
};

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

/**
 * Construct an {@link It}.
 * @class
 * @classdesc An {@link It} defines a single test.
 * @extends Node
 * @param {?Array<string>} prefix - the prefix to the name of this {@link It}
 * @param {string} name - the name of the {@link It}
 * @param {function} body - the test function
 * @param {number=} timeout - the maximum amount of time to run the test
 *   defined by this {@link It} (inherited from the parent {@link Node}
 *   unless overridden)
 */
function It(prefix, name, body, timeout) {
  Node.call(this, prefix, name, body, timeout);
  var test = null;
  Object.defineProperties(this, {
    _test: {
      enumerable: true,
      get: function() {
        return test;
      },
      set: function(_test) {
        test = _test;
      }
    }
  });
}

util.inherits(It, Node);

/**
 * Get the single test defined by this {@link It}.
 * @instance
 * @param {?Array<string>} prefix - the test name prefix
 * @param {?Array<function>} before - the functions to run before the test
 * @param {?Array<function>} after - the functions to run after the test (if
 *   successful)
 * @param {number=} timeout - the maximum amount of time to run the test
 *   if not specified (defaults to 200 milliseconds)
 * @returns Array<Test>
 */
It.prototype._getTests = function _getTests(prefix, before, after, timeout) {
  prefix = prefix || [];
  before = before || [];
  after = after || [];
  timeout = this._timeout || timeout;

  var self = this;

  function lazyPromise() {
    return sequenceDoneables(before).then(function() {
      return convertDoneableToPromise(self._body.bind(self));
    }).then(function() {
      return sequenceDoneables(after);
    }).then(function() {
      return;
    }, function(error) {
      return error;
    });
  }

  var test = new Test(prefix, this._name, lazyPromise);
  this._test = test;
  return [test];
};

// Functions for working with Doneables
// ----------------------------------------------------------------------------

function sequenceDoneables(doneables) {
  if (!doneables.length) {
    return Promise.resolve();
  }
  var doneable = doneables[0];
  doneables = doneables.slice(1);
  return convertDoneableToPromise(doneable).then(function() {
    return sequenceDoneables(doneables);
  });
}

function convertDoneableToPromise(doneable) {
  return new Promise(function(resolve, reject) {
    function done(error) {
      if (arguments.length) {
        return reject(error);
      }
      resolve();
    }
    if (doneable.length) {
      return doneable(done);
    } else {
      doneable();
      resolve();
    }
  });
}

// Example Usage
// ----------------------------------------------------------------------------

// Eventually, we'd define a Mocha-style test runner that pre-populates the
// following globals:

var afterEach = Describe.afterEach;
var beforeEach = Describe.beforeEach;
var describe = Describe.describe;
var it = Describe.it;
var timeout = Describe.timeout;

// Then, we could use `describe` and friends as normal.

function randomTimeout() {
  return Math.random() * 1000;
}

var describeBlock = describe('Alpha', function() {
  timeout();

  beforeEach(function(done) {
    setTimeout(done, randomTimeout());
  });

  it('works', function() {
    assert(true);
  });

  describe('Beta', function() {
    beforeEach(function(done) {
      setTimeout(done, randomTimeout());
    });

    it('works', function() {
    });

    it('does not work', function() {
      assert(false);
    });

    afterEach(function(done) {
      setTimeout(done, randomTimeout());
    });
  });

  it('works asynchronously', function(done) {
    done();
  });

  it('does not work asynchronously', function(done) {
    done(false);
  });

  afterEach(function(done) {
    setTimeout(done, randomTimeout());
  });
});

// Exports
// ----------------------------------------------------------------------------

// Reporter
// ----------------------------------------------------------------------------

function Spec(node) {
  EventEmitter.call(this);
  var tests = node ? node._getTests() : [];
  var nodes = node ? flatten(node) : [];
  var lines = new Array(nodes.length);
  var promise = null;
  Object.defineProperties(this, {
    _lines: {
      enumerable: true,
      get: function() {
        return lines;
      },
      set: function(_lines) {
        lines = _lines;
      }
    },
    _nodes: {
      enumerable: true,
      value: nodes
    },
    _promise: {
      enumerable: true,
      get: function() {
        return promise;
      },
      set: function(_promise) {
        promise = _promise;
      }
    },
    _tests: {
      enumerable: true,
      value: tests
    },
    failures: {
      enumerable: true,
      value: []
    },
    passes: {
      enumerable: true,
      value: []
    },
    stats: {
      enumerable: true,
      value: {
        duration: 0,
        failures: 0,
        passes: 0,
        pending: 0
      }
    }
  });
}

util.inherits(Spec, EventEmitter);

Spec.prototype.start = function start() {
  if (!this._promise) {
    var startTime = Date.now();
    this._promise = Promise.all(this._nodes.map(function(node, i) {
      if (node instanceof Describe) {
        this._lines[i] = node.toString();
      } else if (node instanceof It) {
        var test = node._test;
        this._lines[i] = test.toString();
        return test.start().then(function(test) {
          if (test.err) {
            this.failures.push(test);
            this.stats.failures++;
            test._failureNumber = this.stats.failures;
            this._lines[i] = test.toString();
          } else {
            this.passes.push(test);
            this.stats.passes++;
            this._lines[i] = test.toString();
          }
          this.emit('changed');
        }.bind(this));
      }
    }.bind(this))).then(function() {
      var endTime = Date.now();
      this.stats.duration = endTime - startTime;

      this._lines.push('');

      // HACK(mroberts): OMG...
      var log = console.log;
      console.log = function() {
        var args = [].slice.apply(arguments);
        var lines = util.format.apply(console, args).split('\n');
        this._lines = this._lines.concat(lines);
      }.bind(this);
      Base.prototype.epilogue.call(this);
      console.log = log;

      this.emit('changed');
    }.bind(this));
  }
  return this._promise;
};

Spec.prototype.toString = function toString() {
  return '\n\n' + this._lines.join('\n');
};

function flatten(node, nodes) {
  nodes = nodes || [];
  nodes.push(node);
  if (node._children) {
    node._children.forEach(function(node) {
      if (node instanceof Describe) {
        flatten(node, nodes);
      } else if (node instanceof It) {
        nodes.push(node);
      }
    });
  }
  return nodes;
}

var content = '';

var blessed = require('blessed');

var screen = blessed.screen({
  autoPadding: true,
  smartCSR: true
});

var text = blessed.scrollabletext({
  mouse: true,
  keys: true,
  vi: true
});

text.setContent(content);

screen.append(text);

var Base = require('mocha/lib/reporters/base');
var color = Base.color;
var stringify = require('mocha/lib/utils').stringify;
var type = require('mocha/lib/utils').type;

screen.on('keypress', function(_, key) {
  if (key.name === 'up' || key.name === 'down') {
    text.scroll(key.name === 'up' ? -0 : 0);
  }
});

screen.key(['escape', 'q', 'C-c'], function() {
  return process.exit(0);
});

var spec = new Spec(describeBlock);
spec.start();
text.setContent(spec.toString());
screen.render();

spec.on('changed', function() {
  text.setContent(spec.toString());
  screen.render();
});

module.exports = Describe;
