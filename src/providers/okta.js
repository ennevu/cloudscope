const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getOkta() {
  try {
    const json = await fetch('https://s3.amazonaws.com/okta-ip-ranges/ip_ranges.json').then(res => res.json())
    const cidrs = [...new Set(Object.values(json).flatMap(entry => entry?.ip_ranges ?? []))]
      .map(range => range.includes('/') ? range : `${range}/32`)
      .filter(isValidCIDR)
    if (cidrs.length === 0) return []
    return [{
      provider: 'Okta',
      type: ['saas'],
      service: null,
      addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Okta error: ${error}`)
  }
}
