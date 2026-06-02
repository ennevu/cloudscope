const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getPerplexity() {
  const records = []
  try {
    for (const {url, type} of [
      {url: 'https://www.perplexity.ai/perplexitybot.json', type: 'crawler'},
      {url: 'https://www.perplexity.ai/perplexity-user.json', type: 'agent'}
    ]) {
      const json = await fetch(url).then(res => res.json())
      const cidrs = []
      for (const entry of json.prefixes ?? []) {
        for (const cidr of [entry.ipv4Prefix, entry.ipv6Prefix]) {
          if (cidr && isValidCIDR(cidr)) cidrs.push(cidr)
        }
      }
      if (cidrs.length === 0) continue
      records.push({
        provider: 'Perplexity',
        type: ['saas'],
        service: [type],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      })
    }
    return records
  } catch (error) {
    console.error(`Perplexity error: ${error}`)
  }
}
