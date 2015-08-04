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

  describe('Corge', function() {

    // console.log('Building "Corge"');

    beforeEach(function(done) {
      setTimeout(done, 1000);
    });

    it('grault', function(done) {
      setTimeout(done.bind(null, new Error('Oops')), 1000);
    });

    it('garply', function(done) {
      setTimeout(done, 2000);
    });

  });

  afterEach(function() {
    // console.log('After "bar" and "qux"');
  });

});
