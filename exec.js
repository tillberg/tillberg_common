var cproc = require('child_process');
var util = require('util');
var _ = require('underscore')._;
_.mixin(require('underscore.string'));

var Timer = (function() {
  var Timer = require('./proto').proto();
  function time() { return (new Date()).getTime(); }
  Timer.init = function() {
    this._t = time();
  };
  Timer.elapsed = function() {
    return time() - this._t;
  };
  return Timer;
})();

exports.Timer = Timer;

function rtrim(s) {
	return s.replace(/\s+$/, '');
}

var color = require("./ansi-color").set;

var shutdownCallback;
exports.onShutdown = function(cb) { shutdownCallback = cb; };

function shutdown(signal) {
  if (signal !== 'exit') { info('Received ' + signal +'.'); }
  killLaunchedProcesses();
  if (shutdownCallback) { shutdownCallback(signal); }
  if (signal !== 'exit') { process.exit(); }
}

process.on('SIGTERM', function() { shutdown('SIGTERM'); });
process.on('SIGHUP', function() { shutdown('SIGHUP'); });
process.on('exit', function () { shutdown('exit'); });

var launchedProcesses = [];

function addLaunchedProcess(proc) {
  launchedProcesses.push(proc);
}

function removeLaunchedProcess(proc) {
  launchedProcesses = _.without(launchedProcesses, proc);
}

function killLaunchedProcesses() {
  _.each(launchedProcesses, function(child) {
    verbose('Killing host process ' + child.pid);
    child.kill();
  });
  launchedProcesses = [];
}

function exec2(cmd, args, opts, cb) {
  var simple = _.prune(cmd + ' ' + args.join(' '), 80);
  var printFn = (opts.verbose ? info : verbose);
  printFn('exec2: ' + simple + ' ' + util.inspect(opts));
  if (!opts || !opts.cwd) {
    error('cwd not specified in ' + simple);
  }
  var proc = cproc.spawn(cmd, args, opts),
      out = [],
      err = [],
      t = Timer.make();
  function log(x) {
    process.stdout.write(x + '');
  }
  var lineBuffer = '';
  proc.stdout.on('data', function (data) {
    if (opts.pipe || opts.pipeStdout) { log(data); }
    lineBuffer = lineBuffer + data;
    while (true) {
      var lineMatch = lineBuffer.match(/(.+)\n/);
      if (lineMatch) {
        proc.stdout.emit('line', lineMatch[1]);
        lineBuffer = lineBuffer.replace(/.+\n/, '');
      } else {
        break;
      }
    }
    proc.emit('stdout', data);
    out.push(data);
  });
  proc.stderr.on('data', function (data) {
    if (!opts.quietError) {
      //process.stderr.write(color('    error in ' + simple + ':\n', 'black', true) + color(data + '', 'red'));
      log(data);
    }
    proc.emit('stderr', data);
    err.push(data);
  });
  proc.on('exit', function (code) {
    printFn(t.elapsed() + '  completed2: ' + simple + (code ? ' (' + code + ')' : ''));
    if (cb) {
      cb(code, out.join(''), err.join(''));
    } else if (code) {
      error(out.join('') + err.join(''));
    }
    removeLaunchedProcess(proc);
  });
  addLaunchedProcess(proc);
  return proc;
}

function exec(cmd, opts, cb) {
  if (opts && opts.length !== undefined) {
    return exec2.apply(this, arguments);
  } else {
    info('exec: ' + cmd);
    var t = Timer.make();
    var proc = cproc.exec(cmd, opts, function(error, stdout, stderr) {
      info(t.elapsed() + '  completed ' + cmd);
      if (error) { error('error: ' + error); }
      info(stderr);
      if (cb) { cb.apply(this, arguments); }
      removeLaunchedProcess(proc);
    });
    addLaunchedProcess(proc);
  }
}

exports.exec = exec;
