const { test, before } = require('node:test');
const assert = require('node:assert');
const { load, isIp, getData } = require('../src/index.js');

before(async () => {
  await load({providers:['aws']});
});

test('detect known cloud IP', () => {
  const result = isIp('15.230.39.1').match;
  assert.strictEqual(result, true);
});

test('reject invalid ip', () => {
  const result = isIp('not-an-ip').match;
  assert.strictEqual(result, false);
});

test('restrict by provider', () => {
  const awsCheck = isIp('15.230.39.1', { provider: 'Amazon' });
  assert.strictEqual(awsCheck.match, true);
  assert.strictEqual(awsCheck.provider, 'Amazon');
});

test('restrict by single country', () => {
  const usCheck = isIp('15.230.39.1', { country: 'US' });
  assert.strictEqual(usCheck.match, true);
  assert.strictEqual(usCheck.country, 'US');
});

test('restrict by multiple countries (EU list)', () => {
  const euCheck = isIp('15.230.39.1', {
    country: ['IT', 'DE', 'FR', 'GB']
  });

  // questa IP AWS dovrebbe NON matchare paesi EU
  assert.strictEqual(euCheck.match, false);
});

test('combined filters (country + provider + region)', () => {
  const specialCheck = isIp('15.230.39.1', {
    country: 'US',
    provider: 'Amazon',
    regionId: 'us-east-2'
  });

  assert.strictEqual(specialCheck.match, true);
  assert.strictEqual(specialCheck.provider, 'Amazon');
  assert.strictEqual(specialCheck.country, 'US');
});

test('dataset summary available', () => {
  const data = getData();

  assert.strictEqual(typeof data, 'object');
  assert.strictEqual(Array.isArray(data.providers), true);
  assert.strictEqual(data.providers.length > 0, true);
});