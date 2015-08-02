'use strict';

// Promise
// ============================================================================

// NOTE(mroberts): Because Promise breaks parametricity, it is only "sometimes"
// a Monoid1, Functor, Apply, Applicative, Chain, or Monad. >:(

// Semigroup
// ----------------------------------------------------------------------------

function concat(pa, pb) {
  return Promise.all([pa, pb]).then(function(ab) {
    return ab[0].concat(ab[1]);
  });
}

// Monoid1
// ----------------------------------------------------------------------------

function empty1(empty) {
  return of(empty());
}

// Functor
// ----------------------------------------------------------------------------

function map(a, f) {
  return a.then(function(x) {
    return Promise.resolve(f(x));
  });
}

// Apply
// ----------------------------------------------------------------------------

function ap(pf, pa) {
  return Promise.all([pf, pa]).then(function(fa) {
    return fa[0](fa[1]);
  });
}

// Applicative
// ----------------------------------------------------------------------------

function of(x) {
  return Promise.resolve(x);
}

// Chain
// ----------------------------------------------------------------------------

function chain(pa, f) {
  return pa.then(function(a) {
    return f(a);
  });
}

module.exports.map = map;
