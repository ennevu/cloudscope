const cheerio = require('cheerio')

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
    const $nodes = $('h2, table').toArray()
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

      if (tag === 'h2') {
        // These are the region names  like "China (Hong Kong)"
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
          currentRegionIdInTable = cells[0]
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

        const ranges = cidr.split(',').map(s => s.trim()).filter(Boolean)
        const addressesv4 = ranges.filter(r => r.includes('.'))
        const addressesv6 = ranges.filter(r => r.includes(':'))

        if (!ips.get(currentRegionName)) {
          ips.set(currentRegionName, {
            cloud: 'Aliyun',
            region: currentRegionName,
            regionId: currentRegionIdInTable,
            service: 'DTS',
            addressesv4,
            addressesv6
          })
        } else if (!ips.get(currentRegionName).region) {
          ips.get(currentRegionName).region = currentRegionName
        }

        ips.get(currentRegionName).addressesv4.push(...addressesv4)
        ips.get(currentRegionName).addressesv6.push(...addressesv6)
      })
    }

  } catch (error) {
    console.error(`Error in AliYun: ${error.message}`)
  }
  return Array.from(ips.values())
}