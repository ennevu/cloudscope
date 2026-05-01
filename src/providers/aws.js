 const regionMap = new Map([
    ['GLOBAL', {region:'Global', country: null}],
    ['af-south-1',{region:'Cape Town', country: 'SA'}],
    ['ca-central-1',{region:'Canada Central', country: 'CA'}],
    ['ca-west-1',{region:'Calgary', country: 'CA'}],
    ['us-west-1',{region:'N. California', country: 'US'}],
    ['us-west-2',{region:'Oregon', country: 'US'}],
    ['us-east-1',{region:'N. Virginia', country: 'US'}],
    ['us-east-2',{region:'Ohio', country: 'US'}],
    ['us-gov-east-1',{region:'AWS GovCloud (US-East)', country: 'US'}],
    ['us-gov-west-1',{region:'AWS GovCloud (US-West)', country: 'US'}],
    ['eu-central-1', {region:'Frankfurt', country: 'DE'}],
    ['eu-central-2',{region:'Zurich', country: 'CH'}],
    ['eu-west-1',{region:'Ireland', country: 'IE'}],
    ['eu-west-2',{region:'London', country: 'GB'}],
    ['eu-west-3',{region:'Paris', country: 'FR'}],
    ['eu-south-1',{region:'Milan', country: 'IT'}],
    ['eu-south-2', {region:'Spain', country: 'ES'}],
    ['eu-north-1',{region:'Stockholm', country: 'SE'}],
    ['il-central-1',{region:'Tel Aviv', country: 'IL'}],
    ['sa-east-1',{region:'Sao Paolo', country: 'BR'}],
    ['sa-west-1',{region:'Santiago', country: 'CL'}],
    ['mx-central-1',{region:'Mexico City', country: 'MX'}],
    ['ap-south-1',{region:'Mumbai', country: 'IN'}],
    ['ap-south-2',{region:'Hyderabad', country: 'IN'}],
    ['ap-east-1',{region:'Hong Kong', country: 'HK'}],
    ['ap-east-2',{region:'Taipei', country: 'TW'}],
    ['ap-southeast-1',{region:'Singapore', country: 'SG'}],
    ['ap-southeast-2',{region:'Sydney', country: 'AU'}],
    ['ap-southeast-3',{region:'Jakarta', country: 'ID'}],
    ['ap-southeast-4',{region:'Melbourne', country: 'AU'}],
    ['ap-southeast-5', {region:'Malaysia', country: 'MY'}],
    ['ap-southeast-6', {region:'New Zealand', country: 'NZ'}],
    ['ap-southeast-7',{region:'Bangkok', country: 'TH'}],
    ['ap-northeast-1',{region:'Tokyo', country: 'JP'}],
    ['ap-northeast-2',{region:'Seoul', country: 'KR'}],
    ['ap-northeast-3',{region:'Osaka', country: 'JP'}],
    ['cn-north-1',{region:'Beijing', country: 'CN'}],
    ['cn-northwest-1',{region:'Ningxia', country: 'CN'}],
    ['me-south-1',{region:'Bahrain', country: 'BH'}],
    ['me-central-1', {region:'UAE', country: 'AE'}],
    ['me-west-1', {region:'Saudi Arabia', country: 'SA'}],
    ['us-south-1', {region:'Dallas', country: 'US'}],
    ['eusc-de-east-1',{region:'Berlin', country: 'DE'}]
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
                    region: regionMap.get(entry.region)?.region || null,
                    country: regionMap.get(entry.region)?.country || null,
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
                    region: regionMap.get(entry.region)?.region || null,
                    country: regionMap.get(entry.region)?.country || null,
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
