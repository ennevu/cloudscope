  const regionMap = new Map([
    ['global','Global'],
    ['us-west1','Oregon'],
    ['us-west2','Los Angeles'],
    ['us-west3','Salt Lake City'],
    ['us-west4','Las Vegas'],
    ['us-west8', 'Phoenix'],
    ['us-central1','Iowa'],
    ['us-central2','Tulsa'],
    ['us-east1','South Carolina'],
    ['us-east4','N. Virginia'],
    ['us-east5','Columbus'],
    ['us-east7','Huntsville'],
    ['us-south1','Dallas'],
    ['northamerica-northeast1','Montreal'],
    ['northamerica-northeast2','Toronto'],
    ['southamerica-east1','Sao Paolo'],
    ['southamerica-west1','Santiago'],
    ['northamerica-south1', 'Mexico City'],
    ['northamerica-south2', 'Santiago de Querétaro'],
    ['europe-west1','Belgium'],
    ['europe-west2','London'],
    ['europe-west3','Frankfurt'],
    ['europe-west4','Netherlands'],
    ['europe-west6','Zurich'],
    ['europe-central2','Warsaw'],
    ['europe-west8','Milan'],
    ['europe-southwest1','Madrid'],
    ['europe-west9','Paris'],
    ['europe-west12','Turin'],
    ['europe-west10', 'Berlin'],
    ['europe-west15', 'Heringsdorf'],
    ['europe-north2','Stockholm'],
    ['europe-north1','Finland'],
    ['asia-south1','Mumbai'],
    ['asia-south2','Delhi'],
    ['asia-southeast1','Singapore'],
    ['asia-southeast2','Jakarta'],
    ['asia-southeast3','Bangkok'],
    ['asia-east1','Taiwan'],
    ['asia-east2','Hong Kong'],
    ['asia-northeast1','Tokyo'],
    ['asia-northeast2','Osaka'],
    ['asia-northeast3','Seoul'],
    ['australia-southeast1','Sydney'],
    ['australia-southeast2','Melbourne'],
    ['me-west1','Tel Aviv'],
    ['me-central1','Doha'],
    ['me-central2','Dammam'],
    ['africa-south1','Johannesburg']
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
                    region: regionMap.get(entry.scope) || null,
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