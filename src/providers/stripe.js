const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getStripe() {
  const records = []
  try {
    for (const {url, service} of [
      {url: 'https://stripe.com/files/ips/ips_webhooks.json', service: 'webhook'},
      {url: 'https://stripe.com/files/ips/ips_api.json', service: 'api'}
    ]) {
      const json = await fetch(url).then(res => res.json())
      const cidrs = []
      for (const ranges of Object.values(json)) {
        for (const range of ranges) {
          const cidr = range.includes('/') ? range : range.includes('.') ? `${range}/32` : `${range}/128`
          if (isValidCIDR(cidr)) cidrs.push(cidr)
        }
      }
      if (cidrs.length === 0) continue
      records.push({
        provider: 'Stripe',
        type: ['saas'],
        service: [service],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      })
    }
    return records
  } catch (error) {
    console.error(`Stripe error: ${error}`)
  }
}
