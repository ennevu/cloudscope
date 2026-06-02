const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getNametag() {
  try {
    const json = await fetch('https://nametag.co/ip-ranges.json').then(res => res.json())
    const cidrs = [...(json.ipv4 ?? []), ...(json.ipv6 ?? [])].filter(isValidCIDR)
    if (cidrs.length === 0) return []
    return [{
      provider: 'Nametag',
      type: ['saas'],
      service: null,
      addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Nametag error: ${error}`)
  }
}
