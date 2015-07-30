'use strict';

var assert = require('assert');

var Test = require('./lib/test2');

var dsl = require('./lib/dsl');
var describe = dsl.describe;
var it = dsl.it;
var beforeEach = dsl.beforeEach;
var afterEach = dsl.afterEach;

var tests = describe('Foo', function() {

  console.log('Building "Foo"');

  beforeEach(function() {
    console.log('Before "bar" and "qux"');
  });

  it('bar', function() {
    // Pass
  });

  describe('Baz', function() {

    console.log('Building "Baz"');

    beforeEach(function() {
      console.log('Before "qux"');
    });

    it('qux', function() {
      // Pass
    });

    it('quux', function() {
      assert(false);
    });

    afterEach(function() {
      console.log('After "qux"');
    });

  });

  afterEach(function() {
    console.log('After "bar" and "qux"');
  });

});

function print(a) {
  console.log(JSON.stringify(a));
}

tests = Test.tests(tests);
Promise.all(tests.map(function(test) {
  return test.run().then(function(error) {
    if (!error) {
      console.log(test._name, 'Passed');
    } else {
      console.log(test._name, 'Failed', error);
    }
  });
})).then(function() {
  console.log('All tests finished');
});
