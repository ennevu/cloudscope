const { parseCIDR } = require('ipaddr.js')

module.exports = async function getDataDog() {
    const ips = new Set()
    try {
        const json = await fetch('https://ip-ranges.datadoghq.com/').then(res => res.json())
        delete json.version
        delete json.modified
        for (const [key, values] of Object.entries(json) ) {
            ips.add({
                provider: 'DataDog',
                type: ['saas'],
                service: [key],
                addressesv4: (values.prefixes_ipv4 ?? []).map(prefix => parseCIDR(prefix)),
                addressesv6: (values.prefixes_ipv6 ?? []).map(prefix => parseCIDR(prefix)),
            })
        }
        return Array.from(ips)
    } catch (error) {
        console.error(`Datadog error: ${error}`)
    }
}
