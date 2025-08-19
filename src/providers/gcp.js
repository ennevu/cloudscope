const axios = require('axios')
module.exports = async function getGcp() {
    const ips = new Map()
    try {
        // Get the JSON data of GCP IP ranges
        const json = (await axios.get('https://www.gstatic.com/ipranges/cloud.json', { maxRedirects: 10 })).data
        for (const entry of json?.prefixes ?? []) {
            if (ips.has(entry.scope)) {
                entry.ipv4Prefix ? ips.get(entry.scope).addressesv4.push(entry.ipv4Prefix) : null
                entry.ipv6Prefix ? ips.get(entry.scope).addressesv6.push(entry.ipv6Prefix) : null
            } else {
                ips.set(entry.scope, {
                    cloud: 'Google',
                    region: null,
                    regionId: entry.scope,
                    service: null,
                    addressesv4: entry.ipv4Prefix ? [entry.ipv4Prefix] : [],
                    addressesv6: entry.ipv6Prefix ? [entry.ipv6Prefix] : []
                })
            }
        }
    } catch (error) {
        console.error(`GCP error: ${error}`)
    }
    return Array.from(ips.values())
}