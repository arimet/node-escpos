'use strict';
const util = require('util');
const EventEmitter = require('events');
const SerialPort = require('serialport');

/**
 * SerialPort device
 * @param {[type]} port
 * @param {[type]} options
 */
function Serial(port, options) {
  var self = this;
  options = options || {
    baudRate: 9600,
    autoOpen: false
  };
  this.device = new SerialPort(port, options);
  this.device.on('close', function () {
    self.emit('disconnect', self.device);
    self.device = null;
  });

  this.device.on('data', function (data) {
    self.emit('dataPrinter', data);
    try {
      self.close();
    }
    catch(error) {
      console.log(error);
    }
  });

  EventEmitter.call(this);
  return this;
};

util.inherits(Serial, EventEmitter);

/**
 * open deivce
 * @param  {Function} callback
 * @return {[type]}
 */
Serial.prototype.open = function (callback) {
  this.device.open(callback);
  return this;
};

/**
 * write data to serialport device
 * @param  {[type]}   buf      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Serial.prototype.write = function (data, callback) {
  this.device.write(data, callback);
  return this;
};

/**
 * close device
 * @param  {Function} callback  [description]
 * @param  {int}      timeout   [allow manual timeout for emulated COM ports (bluetooth, ...)]
 * @return {[type]} [description]
 */
Serial.prototype.close = function (callback, timeout) {

  var self = this;

  this.device.drain(function () {

    self.device.flush(function (err) {

      setTimeout(function () {
        
        if (!!self.device) {
          err ? callback && callback(err, self.device) : self.device.close(function (err) {
            self.device = null;
            return callback && callback(err, self.device);
          });
        }
        
      }, "number" === typeof timeout && 0 < timeout ? timeout : 0);

    });

  });

  return this;

};

/**
 * expose
 */
module.exports = Serial;
