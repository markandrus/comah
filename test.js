'use strict';

var assert = require('assert');

describe('Foo', function() {

  // console.log('Building "Foo"');

  beforeEach(function() {
    // console.log('Before "bar" and "qux"');
  });

  it('bar', function() {
    // Pass
  });

  describe('Baz', function() {

    // console.log('Building "Baz"');

    beforeEach(function() {
      // console.log('Before "qux"');
    });

    it('qux', function() {
      // Pass
    });

    it('quux', function() {
      assert(false);
    });

    afterEach(function() {
      // console.log('After "qux"');
    });

  });

  afterEach(function() {
    // console.log('After "bar" and "qux"');
  });

});
