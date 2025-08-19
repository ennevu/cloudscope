const axios = require('axios')
module.exports = async function getAws() {
    const ips = new Map()
    try {
        // Get the JSON data of AWS IP ranges, the json is divided in ipv4 and ipv6 prefixes
        const json = (await axios.get('https://ip-ranges.amazonaws.com/ip-ranges.json', { maxRedirects: 10 })).data
        for (const entry of json?.prefixes ?? []) {
            if (ips.has(`${entry.region}_${entry.service}`)) {
                ips.get(`${entry.region}_${entry.service}`).addressesv4.push(entry.ip_prefix)  //DA VERIFICARE
            } else {
                ips.set(`${entry.region}_${entry.service}`, {
                    cloud: 'Amazon',
                    regionId: entry.region,
                    region: null,
                    service: entry.service,
                    addressesv4: [entry.ip_prefix],
                    addressesv6: []
                })
            }
        }
        for (const entry of json?.ipv6_prefixes ?? []) {
            if (ips.has(`${entry.region}_${entry.service}`)) {
                ips.get(`${entry.region}_${entry.service}`).addressesv6.push(entry.ipv6_prefix)  //DA VERIFICARE
            } else {
                ips.set(`${entry.region}_${entry.service}`, {
                    cloud: 'Amazon',
                    regionId: entry.region,
                    service: entry.service,
                    region: null,
                    addressesv4: [],
                    addressesv6: [entry.ipv6_prefix]
                })
            }
        }
    } catch (error) {
        console.error(`AWS error: ${error}`)
    }
  return Array.from(ips.values())
}