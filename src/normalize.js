/**
 * Takes a raw provider entry and converts it into a normalized record.
 */
function normalizeClouds(entry) {
  if (!entry) return null

  const provider = entry.provider || null
  if (!provider) return null

  const v4 = Array.isArray(entry.addressesv4) ? entry.addressesv4.filter(Boolean) : []
  const v6 = Array.isArray(entry.addressesv6) ? entry.addressesv6.filter(Boolean) : []

  return {
    provider,
    type: entry.type || [],
    country: entry.country ?? null,
    regionId: entry.regionId ?? 'global',
    region: entry.region ?? 'Global',
    service: entry.service ?? null,
    addressesv4: v4,
    addressesv6: v6,
  }
}

function normalizeSaas (entry) {
  if (!entry) return null
  return {
    provider: entry.provider,
    type: entry.type ?? [],
    service: entry.service ?? null,
    addressesv4: entry.addressesv4 ?? [],
    addressesv6: entry.addressesv6 ?? [],
  }
}

module.exports = { normalizeClouds, normalizeSaas }
