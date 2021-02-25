const crypto = require('crypto');
const { promisify } = require('util');

function createDigest(src) {
  return crypto.createHash('sha1').update(src).digest('hex');
}

const script = promisify((redis, ...args) => redis.script(...args));

async function installScript(redis, digest, src) {
  const result = await script(redis, 'load', src);

  if (result !== digest) {
    throw new Error('digest mismatch');
  }
}

const evalsha = promisify((redis, ...args) => redis.evalsha(...args));

exports.createScript = function(redis, src) {
  const digest = createDigest(src);

  return async function runScript(numArgs, ...args) {
      let result, err;
      try {
        result = await evalsha(redis, digest, numArgs, ...args);
      } catch(e) {
        err = e;
      }

      if (err && err.message.includes('NOSCRIPT')) {
        await installScript(redis, digest, src);
        // try again
        result = await evalsha(redis, digest, numArgs, ...args);
      }

      return result;
  };
}
