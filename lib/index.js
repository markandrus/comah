'use strict';

var assert = require('assert');
var Describe = require('./describe');
var Spec = require('./reporters/spec');

var afterEach = Describe.afterEach;
var beforeEach = Describe.beforeEach;
var describe = Describe.describe;
var it = Describe.it;
var timeout = Describe.timeout;

var describeBlock = describe('Alpha', function() {
  timeout();

  beforeEach(function(done) {
    setTimeout(done, randomTimeout());
  });

  it('works', function() {
    assert(true);
  });

  describe('Beta', function() {
    beforeEach(function(done) {
      setTimeout(done, randomTimeout());
    });

    it('works', function() {
    });

    it('does not work', function() {
      assert(false);
    });

    afterEach(function(done) {
      setTimeout(done, randomTimeout());
    });
  });

  it('works asynchronously', function(done) {
    done();
  });

  it('does not work asynchronously', function(done) {
    done(false);
  });

  afterEach(function(done) {
    setTimeout(done, randomTimeout());
  });

  describe('Charlie', function() {
    describe('#foo', function() {
      it('does something', function() {
      });
    });
  });

  function randomTimeout() {
    return 1000; // Math.random() * 1000;
  }
});

// User Interface (UI)
// ----------------------------------------------------------------------------

var blessed = require('blessed');

var screen = blessed.screen({
  autoPadding: true,
  smartCSR: true
});

var text = blessed.scrollabletext({
  mouse: true,
  keys: true,
  vi: true
});

screen.append(text);

screen.on('keypress', function(_, key) {
  if (key.name === 'up' || key.name === 'down') {
    text.scroll(key.name === 'up' ? -0 : 0);
  }
});

screen.key(['escape', 'q', 'C-c'], function() {
  return process.exit(0);
});

var spec = new Spec(describeBlock);

spec.on('changed', function() {
  text.setContent(spec.toString());
  screen.render();
});

setInterval(function() {
  spec.refresh();
}, 75);

spec.start().then(function() {
  screen.program.clear();
  screen.program.normalBuffer();
  screen.program.showCursor();
  screen.program.write(spec.toString());
  process.exit();
});

text.setContent(spec.toString());

screen.render();
