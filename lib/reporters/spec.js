'use strict';

function Line(number, value) {
}

function Spec(node) {
  tests = tests || [];
  var map = new Map();
  Object.defineProperties(this, {
    _lines: {
      enumerable: true,
      value: []
    },
    _map: {
      enumerable: true,
      value: map
    }
  });
  fillMap(map, node);
}

function fillMap(map, node, line) {
  var key = node._name;
  if (!map.has(key)) {
    map.set(key, new Map());
  }
  var next = map.get(key);
}

Spec.prototype.toString = function toString() {
};

module.exports = Spec;
