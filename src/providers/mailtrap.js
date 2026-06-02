const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getMailtrap() {
  try {
    const json = await fetch('https://mailtrap.io/ip-ranges.json').then(res => res.json())
    const cidrs = new Set()
    for (const entry of json.prefixes ?? []) {
      for (const cidr of [entry.ip_prefix, entry.ipv6_prefix]) {
        if (cidr && isValidCIDR(cidr)) cidrs.add(cidr)
      }
    }
    if (cidrs.size === 0) return []
    return [{
      provider: 'Mailtrap',
      type: ['saas'],
      service: null,
      addressesv4: Array.from(cidrs).filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: Array.from(cidrs).filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Mailtrap error: ${error}`)
  }
}
