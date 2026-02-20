/**
 * Takes a raw provider entry and converts it into a normalized record.
 */
function normalizeRecord(entry) {
  if (!entry) return null

  const provider = entry.cloud || null
  if (!provider) return null

  const v4 = Array.isArray(entry.addressesv4) ? entry.addressesv4.filter(Boolean) : []
  const v6 = Array.isArray(entry.addressesv6) ? entry.addressesv6.filter(Boolean) : []

  return {
    provider,
    regionId: entry.regionId ?? 'global',
    region: entry.region ?? 'Global',
    service: entry.service ?? null,
    addressesv4: v4,
    addressesv6: v6,
  }
}

module.exports = { normalizeRecord }
