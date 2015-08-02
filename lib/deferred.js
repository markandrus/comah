'use strict';

var promise = require('./promise');

// Deferred
// ============================================================================

// NOTE(mroberts): Because Promise breaks parametricity, Deferred is only
// "sometimes" a Monoid1, Functor, Apply, Applicative, Chain, or Monad. >:(

function Deferred(promise) {
  var self = this;
  this.promise = promise || new Promise(function(resolve, reject) {
    self.resolve = resolve;
    self.reject = reject;
  });
}

Deferred.prototype.resolve = function resolve() {
  // Do nothing
};

Deferred.prototype.reject = function reject() {
  // Do nothing
};

// Semigroup
// ----------------------------------------------------------------------------

Deferred.prototype.concat = function concat(db) {
  return new Deferred(promise.concat(this.promise, db.promise));
};

// Monoid1
// ----------------------------------------------------------------------------

Deferred.prototype.empty1 = function empty1(empty) {
  return new Deferred(promise.empty1(empty));
};

// Functor
// ----------------------------------------------------------------------------

Deferred.prototype.map = function map(f) {
  return new Deferred(promise.map(this.promise, f));
};

// Apply
// ----------------------------------------------------------------------------

Deferred.prototype.ap = function ap(da) {
  return new Deferred(promise.ap(this.promise, da.promise));
};

// Applicative
// ----------------------------------------------------------------------------

Deferred.of = function of(x) {
  return new Deferred(promise.of(x));
};

module.exports = Deferred;
