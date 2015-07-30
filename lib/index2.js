'use strict';

var dsl = require('./dsl')();
var path = require('path');
var Test = require('./test2');

function Pocha(files) {
  this._files = loadFiles(files || []);
  this._tests = loadTests();
  
}

function loadFiles(files) {
  files.forEach(function(file) {
    file = path.resolve(file);
    require(file);
  });
}

function loadTests() {
  var tests = [];
  dsl.topLevelDescribes.forEach(function(node) {
    Test.tests(node).forEach(function(test) {
      tests.push(test);
    });
  });
  return tests;
}

Pocha.prototype.list = function list() {
  this._tests.forEach(function(test) {
    console.log(test.fullTitle());
  });
};

Pocha.prototype.run = function run() {
  Promise.all(this._tests.map(function(test) {
    return test.run();
  })).then(function(tests) {
    tests.forEach(function(test) {
      console.log(test.fullTitle() + ':', test.err ? 'Failed' : 'Passed');
    });
  });
};

module.exports = Pocha;
