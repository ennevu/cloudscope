const {isValidCIDR, parseCIDR} = require('ipaddr.js')

module.exports = async function getIntercom() {
  const records = new Map()
  try {
    for (const url of [
      'https://static.intercomcdn.com/intercom-ips/au/intercom-ip-ranges.json',
      'https://static.intercomcdn.com/intercom-ips/us/intercom-ip-ranges.json',
      'https://static.intercomcdn.com/intercom-ips/eu/intercom-ip-ranges.json'
    ]) {
      const json = await fetch(url).then(res => res.json())
      for (const entry of json.ip_ranges ?? []) {
        if (!isValidCIDR(entry.range)) continue
        const type = ['saas']
        const service = [entry.service]
        const key = JSON.stringify({type, service})
        if (!records.has(key)) {
          records.set(key, {
            provider: 'Intercom',
            type,
            service,
            addressesv4: [],
            addressesv6: [],
          })
        }
        const record = records.get(key)
        if (entry.range.includes('.')) record.addressesv4.push(parseCIDR(entry.range))
        if (entry.range.includes(':')) record.addressesv6.push(parseCIDR(entry.range))
      }
    }
    return Array.from(records.values())
  } catch (error) {
    console.error(`Intercom error: ${error}`)
  }
}
