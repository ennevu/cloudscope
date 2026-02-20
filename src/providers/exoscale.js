const regionMap = new Map([
    ['de-fra-1','Frankfurt'],
    ['de-muc-1','Munich'],
    ['bg-sof-1','Sofia'],
    ['at-vie-1','Vienna'],
    ['at-vie-2','Vienna'],
    ['ch-gva-2','Geneva'],
    ['ch-dk-1','Zurich'],
    ['ch-dk-2','Zurich'],
    ['hr-zag-1','Zagreb']
])

module.exports = async function getExoscale() {
  const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    const json = await (await fetch('https://exoscale-prefixes.sos-ch-dk-2.exo.io/exoscale_prefixes.json', { maxRedirects: 10 })).json()
    for (const entry of json.prefixes) {
        if (ips.has(entry.zone)) {
            entry.IPv4Prefix ? ips.get(entry.zone).addressesv4.push(entry.IPv4Prefix) : null
            entry.IPv6Prefix ? ips.get(entry.zone).addressesv6.push(entry.IPv6Prefix) : null
        } else {
            ips.set(entry.zone, {
                cloud: 'Exoscale',
                region: regionMap.get(entry.zone) || null,
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
