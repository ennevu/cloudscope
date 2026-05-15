const {isValid, parse} = require('ipaddr.js')
const { normalizeClouds, normalizeSaas } = require('./normalize')
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
const getCloudflare = require('./providers/cloudflare.js')
const getAliyun = require('./providers/aliyun.js')
const getAruba = require('./providers/aruba.js')
const getDataDog = require('./providers/datadog.js')
const getGitHub = require('./providers/github.js')
const getTerraform = require('./providers/terraform.js')
const getCircleCI = require('./providers/circleci.js')
const getZendesk = require('./providers/zendesk.js')
const getOkta = require('./providers/okta.js')
const getGrafana = require('./providers/grafana.js')
const { getGeofeed, gFeeds} = require('./providers/geofeeds.js')

const supportedProviders = [
  'azure',
  'aws',
  'gcp',
  'ibm',
  'oracle',
  'digitalocean',
  'linode',
  'exoscale',
  'vultr',
  'nifcloud',
  'scaleway',
  'cloudflare',
  'aliyun',
  'aruba',
  'elastx',
  'hetzner',
  'eurohoster',
  'hostealo',
  'zappiehost',
  'hosthatch',
  'pumpcloud',
  'kaopucloud',
  'cloudcomtr',
  'crowncloud',
  'mikicloud',
  'gthost',
  'lowhosting',
  'mathost',
  'mchost',
  'mclouds',
  'halocloud',
  'rarecloud',
  'jinxcloud',
  'xtom',
  'akile',
  'vecloud',
  'hostbilby',
  'hostglobal',
  'kamatera',
  'gcore',
  'contabo',
  'timeweb',
  'seasoncloud',
  'datalix',
  'c1vhosting',
  '3hcloud',
  'cloudzy',
  'cloud225',
  'cloudnet',
  'sejacloud',
  'letscloud',
  'maikiwi',
  'serverside',
  'mycloud',
  'mymisaka',
  'railway',
  'csti',
  'seeweb',
  'axera',
  'hostinger',
  '62yun',
  'dedcloud',
  'fastly',
  'rapidseedbox',
  'dynanode',
  'cherryservers'
]

const supportedCompanies = [
  'datadog',
  'github',
  'terraform',
  'circleci',
  'zendesk',
  'okta',
  'grafana'
]

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
    providers = supportedProviders,
    companies = supportedCompanies,
    ttlMs = _store.ttlMs,
    force = false,
  } = opts

  const isFresh = _store.loadedAt && (Date.now() - _store.loadedAt < _store.ttlMs)
  if (isFresh && !force) {
    return { loadedAt: (_store.loadedAt), count: _store.records.length }
  }

  const {byProvider, providerRecords} = await loadProviders(providers)
  const {byCompany, companyRecords} = await loadCompanies(companies)
  const records = [...providerRecords, ...companyRecords]

  _store = {
    loadedAt: Date.now(),
    ttlMs,
    records,
    byCompany,
    byProvider,
  }

  return { loadedAt: _store.loadedAt, count: _store.records.length }
}

async function loadCompanies (companies) {
  const tasks = []
  if (companies.includes('datadog')) tasks.push(getDataDog())
  if (companies.includes('github')) tasks.push(getGitHub())
  if (companies.includes('terraform')) tasks.push(getTerraform())
  if (companies.includes('circleci')) tasks.push(getCircleCI())
  if (companies.includes('zendesk')) tasks.push(getZendesk())
  if (companies.includes('okta')) tasks.push(getOkta())
  if (companies.includes('grafana')) tasks.push(getGrafana())

  const results = await Promise.allSettled(tasks)
  const raw = results
      .filter(r => r.status === 'fulfilled')
      .flatMap((r) => r.value || [])

  const companyRecords = raw
      .map(normalizeSaas)
      .filter((record) => Boolean(record))

  const byCompany = new Map()
  for (const rec of companyRecords) {
    const key = rec.provider
    if (!byCompany.has(key)) byCompany.set(key, [])
    byCompany.get(key).push(rec)
  }
  return {byCompany, companyRecords}
}

async function loadProviders (providers) {
  const tasks = []
  for (const id of providers) {
    if (gFeeds.has(id)) {
      tasks.push(getGeofeed(id))
    }
  }
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
  if (providers.includes('cloudflare')) tasks.push(getCloudflare())
  if (providers.includes('aliyun')) tasks.push(getAliyun())
  if (providers.includes('aruba')) tasks.push(getAruba())
  const results = await Promise.allSettled(tasks)

  const raw = results
      .filter(r => r.status === 'fulfilled')
      .flatMap((r) => r.value || [])

  const providerRecords = raw
      .map(normalizeClouds)
      .filter((record) => Boolean(record))

  const byProvider = new Map()
  for (const rec of providerRecords) {
    const key = rec.provider
    if (!byProvider.has(key)) byProvider.set(key, [])
    byProvider.get(key).push(rec)
  }
  return {byProvider, providerRecords}
}
/**
 * Check whether an IP belongs to any known cloud provider CIDR range.
 */
function isIp(ip, options = {}) {
  if (!isValid(ip)) return { match: false, reason: 'invalid_ip' }
  if (!_store.loadedAt) return {match: false, reason: 'data_not_loaded'}
  ip = parse(ip)

  const { provider, service, regionId, country } = options

  let candidates = _store.records
  if (provider) {
    const arr = _store.byProvider.get(provider) ?? _store.byCompany?.get(provider)
    if (!arr) return { match: false, reason: 'provider_not_loaded' }
    candidates = arr
  }

  if (service) candidates = candidates.filter(r => Array.isArray(r.service) ? r.service.includes(service) : r.service === service)
  if (regionId) candidates = candidates.filter(r => r.regionId === regionId)
  if (country) candidates = candidates.filter(r => Array.isArray(country) ? country.includes(r.country) :  r.country === country)
  const matches = new Map()
  for (const {addressesv4, addressesv6, ...recwoAddr} of candidates) {
    for (const cidr of addressesv4) {
      if (cidr[0].kind() === ip.kind() && ip.match(cidr)) {
        const matchKey = `${recwoAddr.provider}_${recwoAddr?.country ?? null}_${recwoAddr?.regionId ?? null}`
        const match = matches.get(matchKey)
        if (match) {
          if (Array.isArray(match.service) && Array.isArray(recwoAddr.service)) {
            for (const service of recwoAddr.service) {
              if (!match.service.includes(service)) match.service.push(service)
            }
          } else if (!match.service && Array.isArray(recwoAddr.service)) {
            match.service = [...recwoAddr.service]
          }
        } else {
          matches.set(matchKey,{version: cidr[0].kind(), ...recwoAddr, service: Array.isArray(recwoAddr.service) ? [...recwoAddr.service] : recwoAddr.service, cidr: `${cidr[0].toNormalizedString()}/${cidr[1]}`})
        }

        //matches.push({ version: 'ipv4', provider: rec.provider, country: rec.country, regionId: rec.regionId, region: rec.region, service: rec.service, cidr })
      }
    }
    for (const cidr of addressesv6) {
      if (cidr[0].kind() === ip.kind() && ip.match(cidr)) {
        const matchKey = `${recwoAddr.provider}_${recwoAddr?.country ?? null}_${recwoAddr?.regionId ?? null}`
        const match = matches.get(matchKey)
        if (match) {
          if (Array.isArray(match.service) && Array.isArray(recwoAddr.service)) {
            for (const service of recwoAddr.service) {
              if (!match.service.includes(service)) match.service.push(service)
            }
          } else if (!match.service && Array.isArray(recwoAddr.service)) {
            match.service = [...recwoAddr.service]
          }
        } else {
          matches.set(matchKey,{version: cidr[0].kind(), ...recwoAddr, service: Array.isArray(recwoAddr.service) ? [...recwoAddr.service] : recwoAddr.service, cidr: `${cidr[0].toNormalizedString()}/${cidr[1]}`})
        }
        //matches.push({ version: 'ipv6', provider: rec.provider, country: rec.country, regionId: rec.regionId, region: rec.region, service: rec.service, cidr })
      }
    }
  }



  if (matches.size > 0) {
    return {match: true, matches: [...matches.values()]}
  } else {
    return { match: false }
  }

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

function exportData() {
  return _store.records.map(({addressesv4, addressesv6, ...record}) => ({
    ...record,
    addressesv4: addressesv4.map(cidr => `${cidr[0].toNormalizedString()}/${cidr[1]}`),
    addressesv6: addressesv6.map(cidr => `${cidr[0].toNormalizedString()}/${cidr[1]}`),
  }))
}

module.exports = { load, isIp, getData, refresh, exportData }
