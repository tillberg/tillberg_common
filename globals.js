
var color = exports.color = require("./ansi-color");

global.proto = require('./proto').proto;
global.exec = require('./exec').exec;
global.Timer = require('./exec').Timer;
global.once = require('./once').once;
exports.onShutdown = require('./exec').onShutdown;

function throttled(cb, delay) {
  var timeout
    , fire = false
    , lastfire = false;
  function time() {
    return (new Date()).getTime();
  }
  return function() {
    if (!timeout) {
      var nextDelay = delay - (time() - lastfire);
      if (nextDelay <= 0) {
        cb();
        lastfire = time();
      } else {
        timeout = setTimeout(function() {
          if (fire) {
            cb();
            lastfire = time();
          }
          timeout = undefined;
          fire = false;
        }, nextDelay);
      }
    } else {
      fire = true;
    }
  };
}

var StopWatch = (function () {
  var StopWatch = proto();
  function outputAvg() {
    info('[' + this.name + '] num: ' + this.num + ', avg: ' + (this.sum / this.num));
    this.num = 0;
    this.sum = 0;
  }
  StopWatch.init = function (name) {
    this.name = name;
    this.sum = 0;
    this.num = 0;
    var self = this;
    this.outputAvg = throttled(function() { outputAvg.call(self); }, 1000);
  };
  StopWatch.start = function() {
    var t = Timer.make();
    var self = this;
    return function () {
      self.num++;
      self.sum += t.elapsed();
      self.outputAvg();
    };
  };
  return StopWatch;
})();
global.StopWatch = StopWatch;

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

var errorEvents = new events.EventEmitter();

global.errorHandler = function(optionalMessage, cbOnError, cbOnSuccess) {
  if (!cbOnSuccess) {
    // The optional message was omitted
    cbOnSuccess = cbOnError;
    cbOnError = optionalMessage;
    optionalMessage = 'ERR';
  }
  return function(err, arg0, arg1) {
    if (err) {
      var msg = optionalMessage.replace('ERR', err).replace('ARG0', arg0).replace('ARG1', arg1);
      errorEvents.emit('err', msg);
      cbOnError(msg);
    } else {
      cbOnSuccess.apply(this, arguments);
    }
  };
};

global.errorHandler.on = function() {
  errorEvents.on.apply(errorEvents, arguments);
};