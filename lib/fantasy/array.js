'use strict';

// Array
// ============================================================================

// Setoid
// ----------------------------------------------------------------------------

function equals(as, bs) {
  return equlas1(as, bs, strictEquals);
}

// Setoid
// ----------------------------------------------------------------------------

function equals1(as, bs, valueEquals) {
  if (as.length !== bs.length) {
    return false;
  }
  for (var i = 0; i < as.length; i++) {
    if (!valueEquals(as[i], bs[i])) {
      return false;
    }
  }
  return true;
}

// Semigroup
// ----------------------------------------------------------------------------

function concat(as, bs) {
  return as.concat(bs);
}

// Monoid
// ----------------------------------------------------------------------------

function empty() {
  return [];
}

// Functor
// ----------------------------------------------------------------------------

function map(as, f) {
  return as.map(f);
}

// Apply
// ----------------------------------------------------------------------------

function ap(fs, xs) {
  var ys = [];
  fs.forEach(function(f) {
    xs.forEach(function(x) {
      ys.push(f(x));
    });
  });
  return ys;
}


// Applicative
// ----------------------------------------------------------------------------

function of(a) {
  return [a];
}

// Foldable
// ----------------------------------------------------------------------------

function reduce(as, f, x) {
  return as.reduce(function(x, a) {
    return f(a, x);
  }, x);
}

// Traversable
// ----------------------------------------------------------------------------

function cons(f, ys, x) {
  return ap(f(x).map(function(a) {
    return function(bs) {
      return [a].concat(bs);
    };
  }), ys);
}

function traverse(as, f, of) {
  var consF = cons.bind(null, f);
  return as.reduceRight(consF, of([]));
}

function sequence(as, of) {
  return traverse(as, id, of);
}

// Chain
// ----------------------------------------------------------------------------

function chain(as, f) {
  var bs = [];
  as.forEach(function(a) {
    bs = bs.concat(f(a));
  });
  return bs;
}

// Monad
// ----------------------------------------------------------------------------

function join(xss) {
  return xss.reduce(function(ys, xs) {
    return ys.concat(xs);
  }, []);
}

// Helpers
// ----------------------------------------------------------------------------

function id(a) {
  return a;
}

module.exports.equals = equals;
module.exports.equals1 = equals1;
module.exports.concat = concat;
module.exports.empty = empty;
module.exports.map = map;
module.exports.ap = ap;
module.exports.of = of;
module.exports.reduce = reduce;
module.exports.traverse = traverse;
module.exports.sequence = sequence;
module.exports.chain = chain;
module.exports.join = join;
