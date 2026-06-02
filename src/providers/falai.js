const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getFalAI() {
  try {
    const json = await fetch('https://api.fal.ai/v1/meta').then(res => res.json())
    const cidrs = (json.webhook_ip_ranges ?? []).filter(isValidCIDR)
    if (cidrs.length === 0) return []
    return [{
      provider: 'Fal.ai',
      type: ['saas'],
      service: ['webhook'],
      addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Fal.ai error: ${error}`)
  }
}
