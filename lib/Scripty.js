'use strict';
var fs = require('fs');
var Script = require('./Script');

var Scripty = module.exports = function(redis) {
  var self = this;

  if (!(self instanceof Scripty)) {
    return new Scripty(redis);
  }

  self.redis = redis;
  self.cache = {};
  self._cbq = {};
};

Scripty.prototype.eval = function(name, src, args, cb) {
  var self = this;

  self.load(name, src, function(err, script) {
    if (err) return cb(err);

    script.run(args, cb);
  });
};

Scripty.prototype.evalFile = function(name, path, args, cb) {
  var self = this;

  if (!cb && typeof args === 'function') {
    cb = args;
    args = path;
    path = name;
  }

  self.loadFile(name, path, function(err, script) {
    if (err) return cb(err);

    script.run(args, cb);
  });
};

/**
 * Load a script into redis (cached)
 * @param  {string}   name  The name of the script (used for caching)
 * @param  {string}   src   The LUA script source to be loaded into redis
 * @param  {Function} cb
 */
Scripty.prototype.load = function(name, src, cb) {
  var self = this;

  var script = self.cache[name];
  if (script) {
    setImmediate(function() {
      cb(null, script);
    });
    return;
  }

  if (self._cbq[name]) {
    self._cbq[name].push(cb);
    return;
  }

  self._cbq[name] = [ cb ];

  script = new Script(self, name, src);
  script.load(function(err) {
    var q = self._cbq[name];
    self._cbq[name] = null;
    for (var i = 0; i < q.length; i++) {
      q[i](err, script);
    }
  });
};

/**
 * Load a script by filepath rather than source
 * @param  {string}   name The name of the script (used for caching)
 * @param  {string}   path The file path to load
 * @param  {Function} cb   [description]
 */
Scripty.prototype.loadFile = function(name, path, cb) {
  var self = this;

  if (!cb && typeof path === 'function') {
    cb = path;
    path = name;
  }

  var script = self.cache[name];
  if (script) {
    setImmediate(function() {
      cb(null, script);
    });
    return;
  }

  if (self._cbq[name]) {
    self._cbq[name].push(cb);
    return;
  }

  self._cbq[name] = [ cb ];

  fs.readFile(path, { encoding: 'utf8' }, function(err, src) {
    if (err) return cb(err);

    script = new Script(self, name, src);
    script.load(function(err) {
      var q = self._cbq[name];
      self._cbq[name] = null;
      for (var i = 0; i < q.length; i++) {
        q[i](err, script);
      }
    });
  });
};
