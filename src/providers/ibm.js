const iso = require('iso-3166-1')
const {isValidCIDR, parseCIDR} = require('ipaddr.js')
module.exports = async function getIBM() {
  const ips = new Map()
  try {
    const json = await (await fetch("https://raw.githubusercontent.com/dprosper/cidr-calculator/main/data/datacenters.new.json", { maxRedirects: 10 })).json()
    for (const entry of json?.data_centers ?? []) {
      const addressesv4 = []
      const addressesv6 = []
      const country = entry.country === 'ENG' ? 'GB' : iso.whereAlpha3(entry.country)?.alpha2 || null
      for (const net of ["front_end_public_network", "load_balancers_ips"]) {
        for (const blocks of entry[net] ?? []) {
          for (const cidr of blocks?.cidr_blocks ?? []) {
            if (!cidr) continue
            cidr.includes('.') ? addressesv4.push(parseCIDR(cidr)) : null
            cidr.includes(':') ? addressesv6.push(parseCIDR(cidr)) : null
          }
        }
      }
      if (addressesv4.length > 0 || addressesv6.length > 0) {
        ips.set(entry.key, {
          provider: 'IBM',
          type:['cloud'],
          region: entry.city,
          country: country,
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