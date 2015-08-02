'use strict';

var util = require('./util');

// Array
// ============================================================================

function groupsOf(size, as) {
  var groups = [];
  while (as.length > size) {
    groups.push(as.slice(0, size));
    as = as.slice(size);
  }
  if (as.length) {
    groups.push(as);
  }
  return groups;
}

function splitInto(groups, as) {
  groups = Math.min(Math.max(groups, 1), as.length);
  var quotient = Math.floor(as.length / groups);
  var remainder = as.length % groups;
  if (!remainder) {
    return groupsOf(quotient, as);
  }
  var result = [];
  var size;
  while (groups--) {
    size = quotient;
    if (remainder) {
      remainder--;
      size += 1;
    }
    result.push(as.slice(0, size));
    as = as.slice(size);
  }
  return result;
}

function takeFirst(i, as) {
  i = Math.min(Math.max(i,  0), as.length);
  return as.slice(0, i);
}

function dropFirst(i, as) {
  i = Math.min(Math.max(i, 0), as.length);
  return as.slice(i);
}

function splitAt(i, as) {
  // i = Math.min(Math.max(i, 0), as.length);
  // return [as.slice(0, i), as.slice(i)];
  return [takeFirst(i, as), dropFirst(i, as)];
}

// Setoid
// ----------------------------------------------------------------------------

function equals(as, bs) {
  if (as.length !== bs.length) {
    return false;
  }
  for (var i = 0; i < as.length; i++) {
    if (!util.defaultEquals(as[i], bs[i])) {
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
  return traverse(as, util.id, of);
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

module.exports.groupsOf = groupsOf;
module.exports.splitInto = splitInto;
module.exports.takeFirst = takeFirst;
module.exports.dropFirst = dropFirst;
module.exports.splitAt = splitAt;
module.exports.equals = equals;
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
