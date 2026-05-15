const papa = require('papaparse')
const {isValidCIDR, parseCIDR} = require('ipaddr.js')
module.exports = async function getDigitalOcean() {
  const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    const csv = (await (await fetch('https://digitalocean.com/geo/google.csv', { maxRedirects: 10 })).text())
    const rows = papa.parse(csv).data
    for (const entry of rows) {
      if (ips.has(entry[3])) {
        entry[0].includes('.') ? ips.get(entry[3]).addressesv4.push(parseCIDR(entry[0])) : ips.get(entry[3]).addressesv6.push(parseCIDR(entry[0]))
      } else if (entry[3]) {
        ips.set(entry[3], {
          provider: 'Digital Ocean',
          type:['cloud'],
          region: entry[3],
          country: entry[1],
          regionId: entry[2],
          service: null,
          addressesv4: entry[0].includes('.') ? [parseCIDR(entry[0])] : [],
          addressesv6: entry[0].includes(':') ? [parseCIDR(entry[0])] : []
        })
      }
    }
  } catch (error) {
    console.error(`DigitalOcean error: ${error}`)
  }
  return Array.from(ips.values())
}
