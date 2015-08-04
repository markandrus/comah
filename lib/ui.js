'use strict';

var blessed = require('blessed');

// User Interface (UI)
// ============================================================================

function UI(reporter) {
  this._reporter = reporter;

  var screen = this._screen = blessed.screen({
    autoPadding: true,
    smartCSR: true
  });

  var text = this._text = blessed.scrollabletext({
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

  ['changed', 'testFinished'].forEach(function(event) {
    reporter.on(event, function() {
      text.setContent(reporter.toString());
      screen.render();
    });
  });

  reporter.on('testsFinished', function() {
    // FIXME(mroberts): ...
    /* screen.program.clear();
    screen.program.normalBuffer();
    screen.program.showCursor();
    screen.program.write(spec.toString());
    process.exit(); */
  });

  text.setContent(reporter.toString());

  screen.render();
}

UI.prototype.getReporter = function getReporter() {
  return this._reporter;
};

module.exports = UI;
