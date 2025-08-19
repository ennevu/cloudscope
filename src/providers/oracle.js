const axios = require('axios')
module.exports = async function getOracle() {
    const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    const json = (await axios.get('https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json', { maxRedirects: 10 })).data
    for (const entry of json?.regions ?? []) {
      const region = entry.region.split("-")[1].charAt(0).toUpperCase() + String(entry.region.split("-")[1]).slice(1)
      const services = [...new Set(entry.cidrs.flatMap(cidr => cidr.tags))]
      for (const service of services) {
        ips.set(`${entry.region}_${service}`, {
        cloud: 'Oracle',
        region: region,
        regionId: entry.region,
        service,
        addressesv4: entry.cidrs.filter(cidr => cidr.cidr.includes('.') && cidr.tags.includes(service)).map(cidr => cidr.cidr),
        addressesv6: entry.cidrs.filter(cidr => cidr.cidr.includes(':') && cidr.tags.includes(service)).map(cidr => cidr.cidr)
        })
      }
    }
  } catch (error) {
    console.error(`Oracle error: ${error}`)
  }
  return Array.from(ips.values())
}