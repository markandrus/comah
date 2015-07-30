'use strict';

function defaultConcat(a, b) {
  if (a && typeof a.concat === 'function') {
    return a.concat(b);
  }
  return takeFirst(a, b);
}

function defaultEquals(a, b) {
  if (a && typeof a.equals === 'function') {
    return a.equals(b);
  }
  return a === b;
}

function id(a) {
  return a;
}

function takeFirst(a, b) {
  return a;
}

module.exports.defaultConcat = defaultConcat;
module.exports.defaultEquals = defaultEquals;
module.exports.id = id;
module.exports.takeFirst = takeFirst;
