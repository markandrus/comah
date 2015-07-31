'use strict';

var util = require('./util');

// Client
// ============================================================================

function Client(server, id) {
  id = this._id = id || util.uuid();
  this._server = server;

  var ipc = this._ipc = require('node-ipc');
  ipc.config.id = id;
  ipc.config.silent = true;

  this._connected = false;

  var self = this;
  ipc.connectTo(server, function() {
    ipc.of[server].on('connect', function() {
      self._connected = true;
      self._queue.splice(0).forEach(function(pair) {
        self.send(pair[0], pair[1]);
      });
    });
    ipc.of[server].on('disconnect', function() {
      self._connected = false;
    });
  });
}

Client.prototype.getId = function getId() {
  return this._id;
};

Client.prototype.send = function send(event, payload) {
  if (!this._connected) {
    this._queue.push([event, payload]);
  } else {
    this._ipc.of[this._server].emit('event', {
      event: event,
      id: this._id,
      payload: payload
    });
  }
  return this;
};

module.exports = Client;
