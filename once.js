var _ = require('underscore')._;

exports.once = function(promise, thingToDo, callbackWhenDone) {
  if (promise.done) {
    callbackWhenDone(promise.result);
  } else {
    if (!promise.cbs) { promise.cbs = []; }
    if (promise.cbs.length === 0) {
      thingToDo(function(result) {
        promise.result = result;
        promise.done = true;
        _.each(promise.cbs, function(cb) { if (cb) { cb(result); } });
        delete promise.cbs; // clear callbacks; don't clear the result or done properties
      });
    }
    promise.cbs.push(callbackWhenDone);
  }
};
