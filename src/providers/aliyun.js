const cheerio = require('cheerio')
const iso = require('iso-3166-1')
const specialCountryMap = new Map([
  ['South Korea', 'Republic of Korea'],
  ['UAE', 'United Arab Emirates'],
  ['UK', 'United Kingdom of Great Britain and Northern Ireland'],
])
const regionCountryMap = new Map([
  ['ap-northeast-1', 'JP'],
  ['ap-northeast-2', 'KR'],
  ['ap-south-1', 'IN'],
  ['ap-southeast-1', 'SG'],
  ['ap-southeast-2', 'AU'],
  ['ap-southeast-3', 'MY'],
  ['ap-southeast-5', 'ID'],
  ['ap-southeast-6', 'PH'],
  ['ap-southeast-7', 'TH'],
  ['cn-hongkong', 'HK'],
  ['eu-central-1', 'DE'],
  ['eu-west-1', 'GB'],
  ['me-central-1', 'SA'],
  ['me-east-1', 'AE'],
  ['na-south-1', 'MX'],
  ['us-east-1', 'US'],
  ['us-west-1', 'US'],
])

function getCountry(regionName, regionId) {
  if (regionCountryMap.has(regionId)) return regionCountryMap.get(regionId)
  if (regionId?.startsWith('cn-')) return 'CN'

  const countryCandidates = regionName?.split(' (')?.filter(s => !s.includes(')')) ?? []
  return countryCandidates
    .map(c => specialCountryMap.get(c) || c)
    .map(candidate => iso.whereCountry(candidate) || iso.whereAlpha2(candidate) || iso.whereAlpha3(candidate))
    .find(Boolean)?.alpha2 ?? null
}

function normalizeRange(range) {
  if (range.includes('/')) return range
  if (range.includes('.')) return `${range}/32`
  if (range.includes(':')) return `${range}/128`
  return range
}

module.exports = async function getAliyun() {
  const ips = new Map()
  try {
    const page = await (await fetch(
      'https://www.alibabacloud.com/help/en/dts/user-guide/add-the-cidr-blocks-of-dts-servers-to-the-security-settings-of-on-premises-databases',
      { maxRedirects: 10 }
    )).text()
    const $ = cheerio.load(page)
    const $tabs = $('h2, h3').filter((_, el) =>
      $(el).text().trim() === 'Appendix: DTS server IP address ranges'
    ).first()
    const $nodes = $('h2, h3, table').toArray()
    const startIdx = $nodes.findIndex(n => n === $tabs[0])
    if (startIdx === -1) {
      return {}
    }

    let currentRegionName = null
    let currentRegionIdInTable = null

    for (let i = startIdx + 1; i < $nodes.length; i++) {
      const el = $nodes[i]
      const tag = (el.tagName || '').toLowerCase()
      const text = $(el).text().trim()

      if (tag === 'h2' && text === 'FAQ') { break }

      if (tag === 'h2' || tag === 'h3') {
        // These are section labels like "The Chinese mainland" and "Other regions".
        if (text && !text.startsWith('Appendix:')) {
          currentRegionName = text
        }
        continue
      }

      if (!currentRegionName) { continue }

      $(el).find('tr').each((_, tr) => {
        const tds = $(tr).find('td')
        if (!tds.length) {
          return
        }

        const cells = tds.map((_, td) => $(td).text().trim()).get()

        let type, cidr
        if (cells.length >= 3) {
          if (cells[0]) {
            currentRegionIdInTable = cells[0]
          }
          type = cells[1]
          cidr = cells[2]
        } else if (cells.length === 2) {
          type = cells[0]
          cidr = cells[1]
        } else {
          return
        }

        if (!currentRegionIdInTable) {
          return
        }
        if (type !== 'Public IP Address') {
          return
        }

        const ranges = cidr.split(/[\s,]+/).map(s => s.trim()).filter(Boolean).map(normalizeRange)
        const addressesv4 = ranges.filter(r => r.includes('.'))
        const addressesv6 = ranges.filter(r => r.includes(':'))
        const country = getCountry(currentRegionName, currentRegionIdInTable)
        const key = currentRegionIdInTable

        if (!ips.has(key)) {
          ips.set(key, {
            cloud: 'Aliyun',
            country,
            region: currentRegionIdInTable,
            regionId: currentRegionIdInTable,
            service: 'DTS',
            addressesv4: [],
            addressesv6: []
          })
        }

        ips.get(key).addressesv4.push(...addressesv4)
        ips.get(key).addressesv6.push(...addressesv6)
      })
    }

  } catch (error) {
    console.error(`Error in AliYun: ${error.message}`)
  }
  return Array.from(ips.values())
}
