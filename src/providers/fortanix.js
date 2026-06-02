const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getFortanix() {
  const records = new Map()
  try {
    const json = await fetch('https://ip-ranges.fortanix.com/').then(res => res.json())
    for (const entry of json.prefixes ?? []) {
      if (!isValidCIDR(entry.ip_prefix)) continue
      const service = entry.consumers
        ? entry.consumers.map(consumer => `${consumer}_${entry.direction}`)
        : [entry.direction]
      const type = ['saas']
      const key = JSON.stringify({type, service})
      if (!records.has(key)) {
        records.set(key, {
          provider: 'Fortanix',
          type,
          service,
          addressesv4: [],
          addressesv6: [],
        })
      }
      const record = records.get(key)
      if (entry.ip_prefix.includes('.')) record.addressesv4.push(parseCIDR(entry.ip_prefix))
      if (entry.ip_prefix.includes(':')) record.addressesv6.push(parseCIDR(entry.ip_prefix))
    }
    return Array.from(records.values())
  } catch (error) {
    console.error(`Fortanix error: ${error}`)
  }
}
