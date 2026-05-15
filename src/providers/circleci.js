const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getCircleCI() {
  try {
    const json = await fetch('https://circleci.com/docs/ip-ranges-list.json').then(res => res.json())
    return Object.entries(json.IPRanges ?? {}).flatMap(([service, ranges]) => {
      if (!Array.isArray(ranges)) return []
      const cidrs = ranges
        .map(range => range.includes('/') ? range : `${range}/32`)
        .filter(isValidCIDR)
      if (cidrs.length === 0) return []
      return [{
        provider: 'CircleCI',
        type: ['saas'],
        service: [service],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      }]
    })
  } catch (error) {
    console.error(`CircleCI error: ${error}`)
  }
}
