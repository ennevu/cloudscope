const {isValid, parse} = require('ipaddr.js')
const { buildIndex, findCandidates } = require('./index')
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
const getIterable = require('./providers/iterable.js')
const getIntercom = require('./providers/intercom.js')
const getStripe = require('./providers/stripe.js')
const getFortanix = require('./providers/fortanix.js')
const getOpenAI = require('./providers/openai.js')
const getPerplexity = require('./providers/perplexity.js')
const getAuth0 = require('./providers/auth0.js')
const getSvix = require('./providers/svix.js')
const getMailtrap = require('./providers/mailtrap.js')
const getNametag = require('./providers/nametag.js')
const getFalAI = require('./providers/falai.js')
const getAhrefs = require('./providers/ahrefs.js')
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
  'cherryservers',
  'tenbyte',
  'terabix',
  'edgevana'
]

const supportedCompanies = [
  'datadog',
  'github',
  'terraform',
  'circleci',
  'zendesk',
  'okta',
  'grafana',
  'iterable',
  'intercom',
  'stripe',
  'fortanix',
  'openai',
  'perplexity',
  'auth0',
  'svix',
  'mailtrap',
  'nametag',
  'falai',
  'ahrefs'
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
    index: buildIndex(records),
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
  if (companies.includes('iterable')) tasks.push(getIterable())
  if (companies.includes('intercom')) tasks.push(getIntercom())
  if (companies.includes('stripe')) tasks.push(getStripe())
  if (companies.includes('fortanix')) tasks.push(getFortanix())
  if (companies.includes('openai')) tasks.push(getOpenAI())
  if (companies.includes('perplexity')) tasks.push(getPerplexity())
  if (companies.includes('auth0')) tasks.push(getAuth0())
  if (companies.includes('svix')) tasks.push(getSvix())
  if (companies.includes('mailtrap')) tasks.push(getMailtrap())
  if (companies.includes('nametag')) tasks.push(getNametag())
  if (companies.includes('falai')) tasks.push(getFalAI())
  if (companies.includes('ahrefs')) tasks.push(getAhrefs())

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
  const address = parse(ip)

  const { provider, service, regionId, country } = options

  let allowedRecords

  if (provider) {
    const records = _store.byProvider.get(provider) ?? _store.byCompany?.get(provider)

    if (!records) {
      return { match: false, reason: 'provider_not_loaded' }
    }
    allowedRecords = records
  }

  const candidates = findCandidates(_store.index, address, allowedRecords)
  const matches = new Map()

  for (const record of candidates) {
    if (service) {
      const hasService = Array.isArray(record.service)
          ? record.service.includes(service)
          : record.service === service

      if (!hasService) continue
    }

    if (regionId && record.regionId !== regionId) continue

    if (country) {
      const hasCountry = Array.isArray(country)
          ? country.includes(record.country)
          : record.country === country

      if (!hasCountry) continue
    }

    const matchKey =
        `${record.provider}_${record.country ?? null}_${record.regionId ?? null}`

    const match = matches.get(matchKey)

    if (match) {
      if (Array.isArray(match.service) && Array.isArray(record.service)) {
        for (const serviceName of record.service) {
          if (!match.service.includes(serviceName)) {
            match.service.push(serviceName)
          }
        }
      } else if (!match.service && Array.isArray(record.service)) {
        match.service = [...record.service]
      }
    } else {
      const { addressesv4, addressesv6, ...metadata } = record
      const cidr = (address.kind() === 'ipv4' ? addressesv4 : addressesv6)[0]

      matches.set(matchKey, {
        version: address.kind(),
        ...metadata,
        service: Array.isArray(record.service)
            ? [...record.service]
            : record.service,
        cidr: `${cidr[0].toNormalizedString()}/${cidr[1]}`
      })
    }
  }

  if (matches.size === 0) {
    return { match: false }
  }

  return { match: true, matches: [...matches.values()] }
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
