const axios = require('axios')
module.exports = async function getIBM() {
  const ips = new Map()
  try {
    const json = (await axios.get("https://raw.githubusercontent.com/dprosper/cidr-calculator/main/data/datacenters.new.json", { maxRedirects: 10 })).data
    for (const entry of json?.data_centers ?? []) {
      const addressesv4 = []
      const addressesv6 = []
      for (const net of ["front_end_public_network", "load_balancers_ips"]) {
        for (const blocks of entry[net] ?? []) {
          for (const cidr of blocks?.cidr_blocks ?? []) {
            cidr.includes('.') ? addressesv4.push(cidr) : null
            cidr.includes(':') ? addressesv6.push(cidr) : null
          }
        }
      }
      if (addressesv4.length > 0 || addressesv6.length > 0) {
        ips.set(entry.key, {
          cloud: 'IBM',
          region: entry.city,
          regionId: entry.key,
          service: null,
          addressesv4,
          addressesv6
        })
      }
    }
  } catch (error) {
    console.error(`IBM error: ${error}`)
  }
  return Array.from(ips.values())
}