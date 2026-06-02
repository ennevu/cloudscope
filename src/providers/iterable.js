const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getIterable() {
  const records = []
  try {
    for (const url of ['https://api.iterable.com/ip-ranges.json', 'https://api.eu.iterable.com/ip-ranges.json']) {
      const json = await fetch(url).then(res => res.json())
      for (const [service, ranges] of Object.entries(json)) {
        const cidrs = [...(ranges?.prefixes_ipv4 ?? []), ...(ranges?.prefixes_ipv6 ?? [])].filter(isValidCIDR)
        if (cidrs.length === 0) continue
        records.push({
          provider: 'Iterable',
          type: ['saas'],
          service: [service],
          addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
          addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
        })
      }
    }
    return records
  } catch (error) {
    console.error(`Iterable error: ${error}`)
  }
}
