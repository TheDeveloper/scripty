# Scripty

Redis script manager for node.js. Load and run LUA scripts on Redis efficiently.

Scripty also guards against script flushes on Redis. If the Redis script cache is flushed or the script disappears for whatever reason, Scripty will automatically detect this and re-load the script into Redis before executing.

# Requirements

* [node-redis](https://github.com/mranney/node_redis) compatible with `v0.10`
* Redis `v2.6` or above

# Install

`npm install node-redis-scripty`

# Usage

```javascript
var redis = require('redis').createClient();

var src = 'return KEYS[1]';
var scripty = new Scripty(redis);
scripty.eval('script-name', src, [ 1, 'hi' ], function(err, result) {
  // Should print 'hi'
  console.log(result);
});

scripty.evalFile('path-to-lua/file.lua', [ 1, 'hi' ], function(err, result) {
  console.log(result);
});
```

The arguments (`[ 1, 'hi' ]` in the usage examples) are passed to Redis [`evalsha`](http://redis.io/commands/evalsha).
