'use strict';

function sequence(doneables) {
  if (!doneables.length) {
    return Promise.resolve();
  }
  var doneable = doneables[0];
  doneables = doneables.slice(1);
  return toPromise(doneable).then(function() {
    return sequence(doneables);
  });
}

function toPromise(doneable) {
  return new Promise(function(resolve, reject) {
    function done(error) {
      if (arguments.length) {
        return reject(error);
      }
      resolve();
    }
    if (doneable.length) {
      return doneable(done);
    } else {
      doneable();
      resolve();
    }
  });
}

module.exports.sequence = sequence;
module.exports.toPromise = toPromise;
