'use strict';
var array = require('./lib/array');
var Node = require('./lib/node');

var λ = require('fantasy-check/src/adapters/mocha');
var semigroup = require('fantasy-check/src/laws/semigroup');
var functor = require('fantasy-check/src/laws/functor');
var applicative = require('fantasy-check/src/laws/applicative');
var monad = require('fantasy-check/src/laws/monad');
var comonad = require('fantasy-check/src/laws/comonad');

function run(node) {
  return node.reduce(function(as, a) {
    as.push(a);
    return as;
  }, []);
}

// Create a rose tree with a somewhat interesting shape.
function nodeOfArray(a) {
  return Node.of([a])
    .insertLeft(
      Node.of([a])
        .insertLeft(Node.of([a])))
    .insertRight([a]);
}

function runNodeOfArray(node) {
  return array.join(run(node));
}

describe('Node', function() {
  describe('Semigroup', function() {
    it('all', semigroup.laws(λ)(nodeOfArray, runNodeOfArray));
    it('associativity', semigroup.associativity(λ)(nodeOfArray, runNodeOfArray));
  });

  describe('Functor', function() {
    it('all', functor.laws(λ)(nodeOfArray, runNodeOfArray));
    it('identity', functor.identity(λ)(nodeOfArray, runNodeOfArray));
    it('composition', functor.composition(λ)(nodeOfArray, runNodeOfArray));
  });

  describe('Applicative', function() {
    it('all', applicative.laws(λ)(Node, run));
    it('identity',  applicative.identity(λ)(Node, run));
    it('composition', applicative.composition(λ)(Node, run));
    it('homomorphism', applicative.homomorphism(λ)(Node, run));
    it('interchange', applicative.interchange(λ)(Node, run));
  });

  describe('Monad', function() {
    it('all', monad.laws(λ)(Node, run));
    it('left identity', monad.leftIdentity(λ)(Node, run));
    it('right identity', monad.rightIdentity(λ)(Node, run));
    it('associativity', monad.associativity(λ)(Node, run));
  });

  describe('Comonad', function() {
    it('all', comonad.laws(λ)(Node, run));
    it('identity', comonad.identity(λ)(Node, run));
    it('composition', comonad.composition(λ)(Node, run));
    it('associativity', comonad.associativity(λ)(Node, run));
  });
});
