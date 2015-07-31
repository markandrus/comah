'use strict';

function defaultEquals(a, b) {
  if (a && typeof a.equals === 'function') {
    return a.equals(b);
  }
  return a === b;
}

function id(a) {
  return a;
}

function stringifyError(err) {
  var plainObject = {};
  Object.getOwnPropertyNames(err).forEach(function(key) {
    plainObject[key] = err[key];
  });
  return JSON.stringify(plainObject);
};

function takeFirst(a, b) {
  return a;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

module.exports.defaultEquals = defaultEquals;
module.exports.id = id;
module.exports.stringifyError = stringifyError;
module.exports.takeFirst = takeFirst;
module.exports.uuid = uuid;
