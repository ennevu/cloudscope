const regionMap = new Map([
    ['de-fra-1',{region:'Frankfurt', country: 'DE'}],
    ['de-muc-1',{region:'Munich', country: 'DE'}],
    ['bg-sof-1',{region:'Sofia', country: 'BG'}],
    ['at-vie-1',{region:'Vienna', country: 'AT'}],
    ['at-vie-2',{region:'Vienna', country: 'AT'}],
    ['ch-gva-2',{region:'Geneva', country: 'CH'}],
    ['ch-dk-1',{region:'Zurich', country: 'CH'}],
    ['ch-dk-2',{region:'Zurich', country: 'CH'}],
    ['hr-zag-1',{region:'Zagreb', country: 'HR'}]
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
                region: regionMap.get(entry.zone)?.region || null,
                country: regionMap.get(entry.zone)?.country || null,
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
