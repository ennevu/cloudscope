  const regionMap = new Map([
    ['global',{region:'Global', country: null}],
    ['us-west1',{region:'Oregon', country: 'US'}],
    ['us-west2',{region:'Los Angeles', country: 'US'}],
    ['us-west3',{region:'Salt Lake City', country: 'US'}],
    ['us-west4',{region:'Las Vegas', country: 'US'}],
    ['us-west8', {region:'Phoenix', country: 'US'}],
    ['us-central1',{region:'Iowa', country: 'US'}],
    ['us-central2',{region:'Tulsa', country: 'US'}],
    ['us-east1',{region:'South Carolina', country: 'US'}],
    ['us-east4',{region:'N. Virginia', country: 'US'}],
    ['us-east5',{region:'Columbus', country: 'US'}],
    ['us-east7',{region:'Huntsville', country: 'US'}],
    ['us-south1',{region:'Dallas', country: 'US'}],
    ['northamerica-northeast1',{region:'Montreal', country: 'CA'}],
    ['northamerica-northeast2',{region:'Toronto', country: 'CA'}],
    ['southamerica-east1',{region:'Sao Paolo', country: 'BR'}],
    ['southamerica-west1',{region:'Santiago', country: 'CL'}],
    ['northamerica-south1', {region:'Mexico City', country: 'MX'}],
    ['northamerica-south2', {region:'Santiago de Querétaro', country: 'MX'}],
    ['europe-west1',{region:'Belgium', country: 'BE'}],
    ['europe-west2',{region:'London', country: 'GB'}],
    ['europe-west3',{region:'Frankfurt', country: 'DE'}],
    ['europe-west4',{region:'Netherlands', country: 'NL'}],
    ['europe-west6',{region:'Zurich', country: 'CH'}],
    ['europe-central2',{region:'Warsaw', country: 'PL'}],
    ['europe-west8',{region:'Milan', country: 'IT'}],
    ['europe-southwest1',{region:'Madrid', country: 'ES'}],
    ['europe-west9',{region:'Paris', country: 'FR'}],
    ['europe-west12',{region:'Turin', country: 'IT'}],
    ['europe-west10', {region:'Berlin', country: 'DE'}],
    ['europe-west15', {region:'Heringsdorf', country: 'DE'}],
    ['europe-north2',{region:'Stockholm', country: 'SE'}],
    ['europe-north1',{region:'Finland', country: 'FI'}],
    ['asia-south1',{region:'Mumbai', country: 'IN'}],
    ['asia-south2',{region:'Delhi', country: 'IN'}],
    ['asia-southeast1',{region:'Singapore', country: 'SG'}],
    ['asia-southeast2',{region:'Jakarta', country: 'ID'}],
    ['asia-southeast3',{region:'Bangkok', country: 'TH'}],
    ['asia-east1',{region:'Taiwan', country: 'TW'}],
    ['asia-east2',{region:'Hong Kong', country: 'HK'}],
    ['asia-northeast1',{region:'Tokyo', country: 'JP'}],
    ['asia-northeast2',{region:'Osaka', country: 'JP'}],
    ['asia-northeast3',{region:'Seoul', country: 'KR'}],
    ['australia-southeast1',{region:'Sydney', country: 'AU'}],
    ['australia-southeast2',{region:'Melbourne', country: 'AU'}],
    ['me-west1',{region:'Tel Aviv', country: 'IL'}],
    ['me-central1',{region:'Doha', country: 'QA'}],
    ['me-central2',{region:'Dammam', country: 'SA'}],
    ['africa-south1',{region:'Johannesburg', country: 'ZA'}]
  ])
module.exports = async function getGcp() {
    const ips = new Map()
    try {
        // Get the JSON data of GCP IP ranges
        const json = await (await fetch('https://www.gstatic.com/ipranges/cloud.json', { maxRedirects: 10 })).json()
        for (const entry of json?.prefixes ?? []) {
            if (ips.has(entry.scope)) {
                entry.ipv4Prefix ? ips.get(entry.scope).addressesv4.push(entry.ipv4Prefix) : null
                entry.ipv6Prefix ? ips.get(entry.scope).addressesv6.push(entry.ipv6Prefix) : null
            } else {
                ips.set(entry.scope, {
                    cloud: 'Google',
                    region: regionMap.get(entry.scope)?.region || null,
                    country: regionMap.get(entry.scope)?.country || null,
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