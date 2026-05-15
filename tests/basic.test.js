const { test, before } = require('node:test');
const assert = require('node:assert');
const { load, isIp, getData } = require('../src/index.js');

before(async () => {
  await load({ providers: ['aws'], companies: ['datadog'] });
});

test('detect known cloud IP', () => {
  const result = isIp('15.230.39.1').match;
  assert.strictEqual(result, true);
});

test('returns AWS and DataDog matches for shared IP', () => {
  const result = isIp('13.244.85.86');

  assert.strictEqual(result.match, true);
  assert.strictEqual(Array.isArray(result.matches), true);
  assert.strictEqual(result.matches.length, 2);
  assert.deepStrictEqual(
    result.matches.map(match => match.provider).sort(),
    ['Amazon', 'DataDog']
  );
});

test('reject invalid ip', () => {
  const result = isIp('not-an-ip').match;
  assert.strictEqual(result, false);
});

test('restrict by provider', () => {
  const awsCheck = isIp('15.230.39.1', { provider: 'Amazon' });
  assert.strictEqual(awsCheck.match, true);
  assert.strictEqual(awsCheck.matches[0].provider, 'Amazon');
});

test('restrict by single country', () => {
  const usCheck = isIp('15.230.39.1', { country: 'US' });
  assert.strictEqual(usCheck.match, true);
  assert.strictEqual(usCheck.matches[0].country, 'US');
});

test('restrict by service', () => {
  const serviceCheck = isIp('15.230.39.1', {
    provider: 'Amazon',
    service: 'AMAZON'
  });

  assert.strictEqual(serviceCheck.match, true);
  assert.strictEqual(serviceCheck.matches[0].service.includes('AMAZON'), true);

  const missingServiceCheck = isIp('15.230.39.1', {
    provider: 'Amazon',
    service: 'DOES_NOT_EXIST'
  });

  assert.strictEqual(missingServiceCheck.match, false);
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
  assert.strictEqual(specialCheck.matches[0].provider, 'Amazon');
  assert.strictEqual(specialCheck.matches[0].country, 'US');
});

test('dataset summary available', () => {
  const data = getData();

  assert.strictEqual(typeof data, 'object');
  assert.strictEqual(Array.isArray(data.providers), true);
  assert.strictEqual(data.providers.length > 0, true);
});
