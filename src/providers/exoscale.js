const axios = require('axios')
module.exports = async function getExoscale() {
  const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    const json = (await axios.get('https://exoscale-prefixes.sos-ch-dk-2.exo.io/exoscale_prefixes.json', { maxRedirects: 10 })).data
    for (const entry of json.prefixes) {
        if (ips.has(entry.zone)) {
            entry.IPv4Prefix ? ips.get(entry.zone).addressesv4.push(entry.IPv4Prefix) : null
            entry.IPv6Prefix ? ips.get(entry.zone).addressesv6.push(entry.IPv6Prefix) : null
        } else {
            ips.set(entry.zone, {
                cloud: 'Exoscale',
                region: null,
                regionId: entry.zone,
                service: null,
                addressesv4: entry.IPv4Prefix ? [entry.IPv4Prefix] : [],
                addressesv6: entry.IPv6Prefix ? [entry.IPv6Prefix] : []
            })
        }
    }
  } catch (error) {
    console.error(`Exoscale error: ${error}`)
  }
  return Array.from(ips.values())
}
