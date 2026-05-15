const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getZendesk() {
  try {
    const json = await fetch('https://support.zendesk.com/ips').then(res => res.json())
    return Object.entries(json.ips ?? {}).flatMap(([service, values]) => {
      const ranges = [...(values?.all ?? []), ...(values?.specific ?? [])]
      const cidrs = [...new Set(ranges)]
        .map(range => range.includes('/') ? range : `${range}/32`)
        .filter(isValidCIDR)
      if (cidrs.length === 0) return []
      return [{
        provider: 'Zendesk',
        type: ['saas'],
        service: [service],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      }]
    })
  } catch (error) {
    console.error(`Zendesk error: ${error}`)
  }
}
