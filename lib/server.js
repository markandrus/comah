'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var util = require('./util');

// Server
// ============================================================================

function Server(id) {
  id = id || util.uuid();
  EventEmitter.call(this);
  var ipc = this._ipc = require('node-ipc');
  ipc.config.id = this._id = id;
  ipc.config.silent = true;
}

inherits(Server, EventEmitter);

Server.prototype.getId = function getId() {
  return this._id;
};

Server.prototype.start = function start() {
  var ipc = this._ipc;
  var self = this;
  ipc.serve(function() {
    ipc.server.on('event', function(data, socket) {
      self.emit(data.event, data.payload);
    });
  });
  ipc.server.define.listen['event'] = 'Incoming messages from child processes';
  return this;
};

module.exports = Server;
