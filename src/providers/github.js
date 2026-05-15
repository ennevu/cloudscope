const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getGitHub() {
  try {
    const json = await fetch('https://api.github.com/meta').then(res => res.json())
    return Object.entries(json).flatMap(([service, ranges]) => {
      if (!Array.isArray(ranges)) return []
      const cidrs = ranges.filter(isValidCIDR)
      if (cidrs.length === 0) return []
      return [{
        provider: 'GitHub',
        type: ['saas'],
        service: [service],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      }]
    })
  } catch (error) {
    console.error(`GitHub error: ${error}`)
  }
}
