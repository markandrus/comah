'use strict';

var color = require('mocha/lib/reporters/base').color;
var stringify = require('mocha/lib/utils').stringify;
var type = require('mocha/lib/utils').type;

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
    str += color('checkmark', '  ✓')
         + color('pass', ' ' + this._name);
  } else if (this.isFinished) {
    str += color('fail', '  ' + this._failureNumber + ') ' + this._name);
  } else {
    str += color('pending', '  {spinner} ' + this._name);
  }
  return str;
};

module.exports = Test;
