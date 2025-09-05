const Net = require('node:net')
const { ipInCidr } = require('./cidr')
const { normalizeRecord } = require('./normalize')
const getAws = require('./providers/aws')
const getAzure = require('./providers/azure')
const getGcp = require('./providers/gcp')
const getIBM = require('./providers/ibm')
const getOracle = require('./providers/oracle')
const getDigitalOcean = require('./providers/digitalocean')
const getLinode = require('./providers/linode')
const getExoscale = require('./providers/exoscale')
const getVultr = require('./providers/vultr')
const getNifcloud = require('./providers/nifcloud')
const getScaleway = require('./providers/scaleway')


let _store = {
  loadedAt: null,
  ttlMs: 1000 * 60 * 60 * 6, // 6 hours by default
  records: [],
  byProvider: new Map(),
}

/**
 * Download and normalize cloud provider IP ranges into memory.
 * - Uses an in-memory cache with a TTL.
 * - If data is fresh and `force` is not set, does nothing and returns a summary.
 */
async function load(opts = {}) {
  const {
    providers = ['azure','aws','gcp','ibm','oracle','digitalocean','linode','exoscale','vultr', 'nifcloud', 'scaleway'],
    ttlMs = _store.ttlMs,
    force = false,
  } = opts

  const isFresh = _store.loadedAt && (Date.now() - _store.loadedAt < _store.ttlMs)
  if (isFresh && !force) {
    return { loadedAt: (_store.loadedAt), count: _store.records.length }
  }

  const tasks = []
  if (providers.includes('azure')) tasks.push(getAzure())
  if (providers.includes('aws')) tasks.push(getAws())
  if (providers.includes('gcp')) tasks.push(getGcp())
  if (providers.includes('ibm')) tasks.push(getIBM())
  if (providers.includes('oracle')) tasks.push(getOracle())
  if (providers.includes('digitalocean')) tasks.push(getDigitalOcean())
  if (providers.includes('linode')) tasks.push(getLinode())
  if (providers.includes('exoscale')) tasks.push(getExoscale())
  if (providers.includes('vultr')) tasks.push(getVultr())
  if (providers.includes('nifcloud')) tasks.push(getNifcloud())
  if (providers.includes('scaleway')) tasks.push(getScaleway())

  const results = await Promise.allSettled(tasks);

  const raw = results
    .filter(r => r.status === 'fulfilled')
    .flatMap((r) => r.value || [])

  const records = raw
    .map(normalizeRecord)
    .filter((record) => Boolean(record))

  const byProvider = new Map()
  for (const rec of records) {
    const key = rec.provider
    if (!byProvider.has(key)) byProvider.set(key, [])
    byProvider.get(key).push(rec)
  }

  _store = {
    loadedAt: Date.now(),
    ttlMs,
    records,
    byProvider,
  }

  return { loadedAt: _store.loadedAt, count: _store.records.length }
}

/**
 * Check whether an IP belongs to any known cloud provider CIDR range.
 * Automatically calls `load()` once if the cache is empty.
 */
async function isIp(ip, options = {}) {
  if (!Net.isIP(ip)) return { match: false, reason: 'invalid_ip' }
  if (!_store.loadedAt) await load()

  const { provider, service, regionId } = options

  let candidates = _store.records
  if (provider) {
    const arr = _store.byProvider.get(provider)
    if (!arr) return { match: false, reason: 'provider_not_loaded' }
    candidates = arr
  }

  if (service) candidates = candidates.filter(r => r.service === service)
  if (regionId) candidates = candidates.filter(r => r.regionId === regionId)

  for (const rec of candidates) {
    for (const cidr of rec.addressesv4) {
      if (ipInCidr(ip, cidr)) {
        return { match: true, version: 'ipv4', provider: rec.provider, regionId: rec.regionId, region: rec.region, service: rec.service, cidr };
      }
    }
    for (const cidr of rec.addressesv6) {
      if (ipInCidr(ip, cidr)) {
        return { match: true, version: 'ipv6', provider: rec.provider, regionId: rec.regionId, region: rec.region, service: rec.service, cidr };
      }
    }
  }

  return { match: false }
}

/**
 * Get a lightweight summary of the current in-memory dataset.
 */
function getData() {
  return {
    loadedAt: _store.loadedAt,
    ttlMs: _store.ttlMs,
    count: _store.records.length,
    providers: Array.from(_store.byProvider.keys()),
  }
}

/**
 * Force a refresh, ignoring cache freshness.
 */
async function refresh() {
  return load({ force: true })
}

module.exports = { load, isIp, getData, refresh }
