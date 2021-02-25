const { expect } = require('chai');
const { createScript } = require("../lib");
const redis = require('redis').createClient({ port: 6385 });

describe('script', () => {
  it('runs script', async () => {
    const src = 'return KEYS[1]';
    const echo = createScript(redis, src);
    const result = await echo(1, 'hello');
    expect(result).to.equal('hello');
  });
});
