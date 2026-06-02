const {isValidCIDR, parseCIDR} = require('ipaddr.js')

function normalizeRange(range) {
  if (range.includes('/')) return range
  if (range.includes('.')) return `${range}/32`
  if (range.includes(':')) return `${range}/128`
  return range
}

module.exports = async function getSvix() {
  try {
    const json = await fetch('https://docs.svix.com/webhook-ips.json').then(res => res.json())
    const cidrs = new Set()
    for (const ranges of Object.values(json)) {
      for (const range of ranges) {
        const cidr = normalizeRange(range)
        if (isValidCIDR(cidr)) cidrs.add(cidr)
      }
    }
    if (cidrs.size === 0) return []
    return [{
      provider: 'Svix',
      type: ['saas'],
      service: ['webhook'],
      addressesv4: Array.from(cidrs).filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: Array.from(cidrs).filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Svix error: ${error}`)
  }
}
