scripty
=======

Easily run redis scripts from Node.

# Requirements

* [node-redis](https://github.com/mranney/node_redis) v0.10+
* Redis `v2.6` or above
* Node 10+

# Install

    npm install node-redis-scripty

# Usage

```javascript
const redis = require('redis').createClient();

const scriptSrc = 'return KEYS[1]';

// give it a redis client and script source
const echo = createScript(redis, scriptSrc);
// you get back a function that runs your script with given args
// redis requires you to tell it how many arguments to expect
const numArgs = 1;
const result = await echo(numArgs, 'hi');
// Should print 'hi'
console.log(result);
```

# Test
```bash
# install docker & docker-compose for local redis setup
npm test
```
