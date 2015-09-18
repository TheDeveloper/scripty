var should = require('should');
var redis = require('redis').createClient();
var Scripty = require('../lib/Scripty');

var src = 'return KEYS[1]';

before(function(done){
  redis.script('flush', done);
});

describe('scripty', function() {
  var scripty = new Scripty(redis);

  it('registers script and caches digest', function(done) {
    scripty.load('blank', src, function(err, blank) {
      should.not.exist(err);
      (typeof blank.digest).should.equal('string');
      blank.digest.length.should.equal(40);

      redis.script('exists', blank.digest, function(err, exists) {
        should.not.exist(err);
        exists[0].should.equal(1);

        should.exist(scripty.cache.blank);

        return done();
      });
    });
  });

  it('runs script', function(done) {
    scripty.load('blank1', src, function(err, blank) {
      blank.run(1, 'hi', function(err, result) {
        should.not.exist(err);
        result.should.equal('hi');

        done();
      });
    });
  });

  it('runs script via eval', function(done) {
    scripty.eval('blank2', src, [ 1, 'hi' ], function(err, result) {
      should.not.exist(err);
      result.should.equal('hi');

      done();
    });
  });

  it('runs script via evalFile', function(done) {
    scripty.evalFile('blank3', __dirname + '/lua/script.lua', [ 1, 'hi' ], function(err, result) {
      should.not.exist(err);
      result.should.equal('hi');

      done();
    });
  });

  it('runs script via evalFile without name', function(done) {
    scripty.evalFile(__dirname + '/lua/script.lua', [ 1, 'hi' ], function(err, result) {
      should.not.exist(err);
      result.should.equal('hi');

      done();
    });
  });

  it('re-caches if script is run after being flushed from redis', function(done) {
    scripty.load('blank4', src, function(err, blank) {
      should.not.exist(err);

      redis.script('flush', function(err) {
        blank.run(1, 'hi', function(err, result) {
          should.not.exist(err);
          result.should.equal('hi');

          should.exist(scripty.cache.blank);

          return done();
        });
      });
    });
  });

  it('uses a de-duping callback queue', function() {
    scripty.load('blank5', src, function(){});
    scripty.load('blank5', src, function(){});
    scripty._cbq.blank5.length.should.equal(2);
  });

  it('runs script via evalFile', function(done) {
    scripty.evalFile('blank7', __dirname + '/lua/script.lua', [ 1, 'hi' ], function(err, result) {
      should.not.exist(err);
      result.should.equal('hi');

      done();
    });
  });
});
