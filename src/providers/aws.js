 const regionMap = new Map([
    ['GLOBAL', 'Global'],
    ['af-south-1','Cape Town'],
    ['ca-central-1','Canada Central'],
    ['ca-west-1','Calgary'],
    ['us-west-1','N. California'],
    ['us-west-2','Oregon'],
    ['us-east-1','N. Virginia'],
    ['us-east-2','Ohio'],
    ['eu-central-1', 'Frankfurt'],
    ['eu-central-2','Zurich'],
    ['eu-west-1','Ireland'],
    ['eu-west-2','London'],
    ['eu-west-3','Paris'],
    ['eu-south-1','Milan'],
    ['eu-south-2', 'Spain'],
    ['eu-north-1','Stockholm'],
    ['il-central-1','Tel Aviv'],
    ['sa-east-1','Sao Paolo'],
    ['mx-central-1','Mexico City'],
    ['ap-south-1','Mumbai'],
    ['ap-south-2','Hyderabad'],
    ['ap-east-1','Hong Kong'],
    ['ap-east-2','Taipei'],
    ['ap-southeast-1','Singapore'],
    ['ap-southeast-2','Sydney'],
    ['ap-southeast-3','Jakarta'],
    ['ap-southeast-4','Melbourne'],
    ['ap-southeast-5', 'Malaysia'],
    ['ap-southeast-6', 'New Zealand'],
    ['ap-southeast-7','Bangkok'],
    ['ap-northeast-1','Tokyo'],
    ['ap-northeast-2','Seoul'],
    ['ap-northeast-3','Osaka'],
    ['cn-north-1','Beijing'],
    ['cn-northwest-1','Ningxia'],
    ['me-south-1','Bahrain'],
    ['me-central-1', 'UAE'],
    ['eusc-de-east-1','Berlin']
  ])

module.exports = async function getAws() {
    const ips = new Map()
    try {
        // Get the JSON data of AWS IP ranges, the json is divided in ipv4 and ipv6 prefixes
        const json = await (await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json', { maxRedirects: 10 })).json()
        for (const entry of json?.prefixes ?? []) {
            if (ips.has(`${entry.region}_${entry.service}`)) {
                ips.get(`${entry.region}_${entry.service}`).addressesv4.push(entry.ip_prefix)  //DA VERIFICARE
            } else {
                ips.set(`${entry.region}_${entry.service}`, {
                    cloud: 'Amazon',
                    regionId: entry.region,
                    region: regionMap.get(entry.region) || null,
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