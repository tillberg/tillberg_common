
var color = exports.color = require("./ansi-color");

global.proto = require('./proto').proto;
global.exec = require('./exec').exec;
global.Timer = require('./exec').Timer;
global.once = require('./once').once;
exports.onShutdown = require('./exec').onShutdown;

function throttled(cb, delay) {
  var timeout
    , fire = false;
  return function() {
    if (!timeout) {
      cb();
      timeout = setTimeout(function() {
        if (fire) { cb(); }
        timeout = undefined;
        fire = false;
      }, delay);
    } else {
      fire = true;
    }
  };
}

global.toInt = function(x) {
  return parseInt(x + '', 10);
};

var util = require('util');
global.debug = function(x, name) {
  global.error((name ? name + ': ' : '') + util.inspect(x));
};

var events  = require('events');
var logger = new events.EventEmitter();
exports.logger = logger;

global.error = function(s) {
  logger.emit('data', 'error', s);
  console.error(color.set(s, "red"));
};

global.warn = function(s) {
  logger.emit('data', 'warn', s);
  console.log(color.set(s, "yellow"));
};


global.info = function(s) {
  logger.emit('data', 'info', s);
  console.log(color.set(s, "black", true));
};

global.verbose = function(s) {
  logger.emit('data', 'verbose', s);
  //console.log(color.set(s, "black", true));
};

global.throttled = throttled;
