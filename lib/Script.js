var crypto = require('crypto');

var Script = module.exports = function(scripty, name, src) {
  var self = this;
  self.scripty = scripty;
  self.redis = this.scripty.redis;
  self.name = name;
  self.src = src;

  Object.defineProperty(self, 'digest', {
    enumerable: true,
    get: function() {
      return self._digest || (self._digest = crypto.createHash('sha1').update(self.src).digest('hex'));
    }
  });
};

Script.prototype.load = function(cb) {
  var self = this;

  self.redis.script('load', self.src, function(err, redisDigest) {
    if (err) return cb(err);

    if (redisDigest !== self.digest) return cb(new Error('digest mismatch'));

    self.scripty.cache[self.name] = self;
    cb(err);
  });
};

Script.prototype.run = function(args, cb) {
  var self = this;

  if (!Array.isArray(args) || typeof cb !== 'function') {
    args = Array.prototype.slice.call(arguments);
    if (typeof args[args.length - 1] === 'function') cb = args.pop();
  }

  if (!cb) cb = function() {};

  self.redis.evalsha([ self.digest ].concat(args), function(err) {
    if (!err || err.message.indexOf('NOSCRIPT') === -1) return cb.apply(cb, arguments);

    // got a noscript error, let's try loading up again and running
    self.scripty.cache[self.name] = null;
    self.scripty.eval(self.name, self.src, args, cb);
  });
};
