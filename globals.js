
global.proto = require('./proto').proto;
global.exec = require('./exec').exec;
global.Timer = require('./exec').Timer;
global.once = require('./once').once;

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
  console.error((name ? name + ': ' : '') + util.inspect(x));
};

var color = require("./ansi-color").set;
var events  = require('events');
var logger = new events.EventEmitter();
exports.logger = logger;

global.error = function(s) {
  logger.emit('data', 'error', s);
  console.error(color(s, "red"));
};

global.warn = function(s) {
  logger.emit('data', 'warn', s);
  console.log(color(s, "yellow"));
};


global.info = function(s) {
  logger.emit('data', 'info', s);
  console.log(color(s, "black", true));
};

global.verbose = function(s) {
  logger.emit('data', 'verbose', s);
  //console.log(color(s, "black", true));
};

global.throttled = throttled;
