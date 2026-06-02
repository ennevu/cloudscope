const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getAuth0() {
  try {
    const json = await fetch('https://cdn.auth0.com/ip-ranges.json').then(res => res.json())
    const cidrs = new Set()
    for (const region of Object.values(json.regions ?? {})) {
      for (const cidr of [...(region.ipv4_cidrs ?? []), ...(region.ipv6_cidrs ?? [])]) {
        if (isValidCIDR(cidr)) cidrs.add(cidr)
      }
    }
    if (cidrs.size === 0) return []
    return [{
      provider: 'Auth0',
      type: ['saas'],
      service: null,
      addressesv4: Array.from(cidrs).filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: Array.from(cidrs).filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Auth0 error: ${error}`)
  }
}
