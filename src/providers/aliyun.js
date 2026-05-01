const cheerio = require('cheerio')
const regionMap = new Map([
  ['global',{region:'Global', country: null}],
  ['ap-south-1',{region:'', country: 'IN'}],
  ['ap-southeast-1',{region:'Singapore', country: 'SG'}],
  ['ap-southeast-2',{region:'', country: 'AU'}],
  ['ap-southeast-3',{region:'Kuala Lumpur', country: 'MY'}],
  ['ap-southeast-5',{region:'Jakarta', country: 'ID'}],
  ['ap-southeast-6',{region:'Manila', country: 'PH'}],
  ['ap-southeast-7',{region:'Bangkok', country: 'TH'}],
  ['ap-northeast-1',{region:'Tokyo', country: 'JP'}],
  ['ap-northeast-2',{region:'Seul', country: 'KR'}],
  ['cn-hongkong',{region:'Hong Kong', country: 'HK'}],
  ['eu-central-1',{region:'Frankfurt', country: 'DE'}],
  ['eu-west-1',{region:'London', country: 'GB'}],
  ['me-central-1',{region:'Riyadh', country: 'SA'}],
  ['me-east-1',{region:'Dubai', country: 'AE'}],
  ['na-south-1',{region:'Mexico City', country: 'MX'}],
  ['us-east-1',{region:'Virginia', country: 'US'}],
  ['us-west-1',{region:'Silicon Valley', country: 'US'}],
  ['cn-hangzhou',{region:'Hangzhou', country: 'CN'}],
  ['cn-shanghai',{region:'Shanghai', country: 'CN'}],
  ['cn-qingdao',{region:'Qingdao', country: 'CN'}],
  ['cn-beijing',{region:'Beijing', country: 'CN'}],
  ['cn-zhangjiakou',{region:'Zhangjiakou', country: 'CN'}],
  ['cn-huhehaote',{region:'Hohot', country: 'CN'}],
  ['cn-wulanchabu',{region:'Ulanqab', country: 'CN'}],
  ['cn-shenzhen',{region:'Shenzhen', country: 'CN'}],
  ['cn-heyuan',{region:'Heyuan', country: 'CN'}],
  ['cn-guangzhou',{region:'Guangzhou', country: 'CN'}],
  ['cn-wuhan-lr',{region:'Wuhan', country: 'CN'}],
  ['cn-chengdu',{region:'Chengdu', country: 'CN'}]
])


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
        const key = currentRegionIdInTable

        if (!ips.has(key)) {
          ips.set(key, {
            cloud: 'Aliyun',
            country: regionMap.get(currentRegionIdInTable)?.country ||  null,
            region: regionMap.get(currentRegionIdInTable)?.region || currentRegionName,
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
