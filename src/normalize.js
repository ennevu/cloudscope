/**
 * Takes a raw provider entry and converts it into a normalized record.
 */
function normalizeRecord(entry) {
  if (!entry) return null;

  // Normalize provider names
  const providerMap = {
    Amazon: 'Amazon',
    Microsoft: 'Microsoft',
    Google: 'Google',
    Oracle: 'Oracle',
    IBM: 'IBM',
    'Digital Ocean': 'Digital Ocean',
    Linode: 'Linode',
    Exoscale: 'Exoscale',
    Vultr: 'Vultr',
  };

  const provider = providerMap[entry.cloud] || entry.cloud || null;
  if (!provider) return null;

  const v4 = Array.isArray(entry.addressesv4) ? entry.addressesv4.filter(Boolean) : [];
  const v6 = Array.isArray(entry.addressesv6) ? entry.addressesv6.filter(Boolean) : [];

  return {
    provider,
    regionId: entry.regionId ?? 'global',
    region: entry.region ?? null,
    service: entry.service ?? null,
    addressesv4: v4,
    addressesv6: v6,
  };
}

module.exports = { normalizeRecord };
