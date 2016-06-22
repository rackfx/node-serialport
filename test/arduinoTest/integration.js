'use strict';
var crypto = require('crypto');
var assert = require('chai').assert;
var SerialPort = require('../../');

var platform;
switch (process.platform) {
  case 'win32':
    platform = 'win32';
    break;
  case 'darwin':
    platform = 'darwin';
    break;
  default:
    platform = 'unix';
}

// Matches arduinoEcho.ino
var SET_BAUD_57600 = 130;
var SET_BAUD_9600 = 131;

var testPort = process.env.TEST_PORT;

if (!testPort) {
  throw 'These test require an arduino loaded with the arduinoEcho program on a serialport set to the TEST_PORT env var';
}

describe('SerialPort Integration tests', function() {
  it('.list', function(done) {
    SerialPort.list(function(err, ports) {
      var foundPort = false;
      ports.forEach(function(port) {
        if (port.comName === testPort){
          foundPort = true;
        }
      });
      assert.isTrue(foundPort);
      done();
    });
  });

  // Be careful to close the ports when you're done with them
  // Ports are exclusively locked in windows and maybe other platforms eventually

  describe('#update', function() {
    if (platform === 'win32') {
      return it("Isn't supported on windows yet");
    }

    it('allows changing the baud rate of an open port', function(done) {
      var port = new SerialPort(testPort, function() {
        port.update({baudRate: 57600}, function(err) {
          assert.isNull(err);
          port.close(done);
        });
      });
    });
    it('can still read and write after a baud change', function(done) {
      var port = new SerialPort(testPort,{parser: SerialPort.parsers.byteLength(1)});
      port.on('data', function(data) {
        console.log(data.toString(), data[0]);
        if (data.toString() === 'Y') {
          port.write(new Buffer([SET_BAUD_9600]));
          port.update({baudRate: 57600});
        }
        // Ignore the ready string
        if (data[0] <= 127) {
          return;
        }
        if (data[0] === SET_BAUD_9600) {
          port.close(done);
        }
        // throw new Error('Unexpected command: ' + data[0]);
      });
    });
  });

  describe('#read and #write', function() {
    it('writes 5k and reads it back', function(done) {
      this.timeout(20000);
      // 5k of random ascii
      var output = new Buffer(crypto.randomBytes(5000).toString('ascii'));
      var expectedInput = Buffer.concat([new Buffer('READY'), output]);
      var port = new SerialPort(testPort);

      // this will trigger from the "READY" the arduino sends when it's... ready
      port.once('data', function(){
        port.write(output);
      });

      var input = new Buffer(0);
      port.on('data', function(data) {
        input = Buffer.concat([input, data]);
        if (input.length === expectedInput.length){
          assert.deepEqual(expectedInput, input);
          port.close(done);
        }
      });
    });
  });
});
