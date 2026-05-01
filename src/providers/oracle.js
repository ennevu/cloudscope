const regionMap = new Map([
  ['global',{region:'Global', country: null}],
  ['mx-monterrey-1',{region:'Monterrey', country: 'MX'}],
  ['ca-toronto-1',{region:'Toronto', country: 'CA'}],
  ['eu-madrid-1',{region:'Madrid', country: 'ES'}],
  ['me-abudhabi-1',{region:'Abudhabi', country: 'AE'}],
  ['af-casablanca-1',{region:'Casablanca', country: 'MA'}],
  ['ap-seoul-1',{region:'Seoul', country: 'KR'}],
  ['ap-seoul-1',{region:'Seoul', country: 'KR'}],
  ['af-johannesburg-1',{region:'Johannesburg', country: 'ZA'}],
  ['ap-batam-1',{region:'Batam', country: 'ID'}],
  ['ap-chuncheon-1',{region:'Chuncheon', country: 'KR'}],
  ['ap-delhi-1',{region:'Delhi', country: 'IN'}],
  ['ap-hyderabad-1',{region:'Hyderabad', country: 'IN'}],
  ['ap-kulai-1',{region:'Kulai', country: 'MY'}],
  ['ap-melbourne-1',{region:'Melbourne', country: 'AU'}],
  ['ap-mumbai-1',{region:'Mumbai', country: 'IN'}],
  ['ap-osaka-1',{region:'Osaka', country: 'JP'}],
  ['ap-singapore-1',{region:'Singapore', country: 'SG'}],
  ['ap-singapore-2',{region:'Singapore', country: 'SG'}],
  ['ap-sydney-1',{region:'Sydney', country: 'AU'}],
  ['ap-tokyo-1',{region:'Tokyo', country: 'JP'}],
  ['ca-montreal-1',{region:'Montreal', country: 'CA'}],
  ['eu-amsterdam-1',{region:'Amsterdam', country: 'NL'}],
  ['eu-dublin-3',{region:'Dublin', country: 'IE'}],
  ['eu-frankfurt-1',{region:'Frankfurt', country: 'DE'}],
  ['eu-jovanovac-1',{region:'Jovanovac', country: 'RS'}],
  ['eu-madrid-3',{region:'Madrid', country: 'ES'}],
  ['eu-marseille-1',{region:'Marseille', country: 'FR'}],
  ['eu-milan-1',{region:'Milan', country: 'IT'}],
  ['eu-paris-1',{region:'Paris', country: 'FR'}],
  ['eu-stockholm-1',{region:'Stockholm', country: 'SE'}],
  ['eu-zurich-1',{region:'Zurich', country: 'CH'}],
  ['il-jerusalem-1',{region:'Jerusalem', country: 'IL'}],
  ['me-dubai-1',{region:'Dubai', country: 'AE'}],
  ['me-jeddah-1',{region:'Jeddah', country: 'SA'}],
  ['me-riyadh-1',{region:'Riyadh', country: 'SA'}],
  ['mx-queretaro-1',{region:'Queretaro', country: 'MX'}],
  ['sa-bogota-1',{region:'Bogota', country: 'CO'}],
  ['sa-riodejaneiro-2',{region:'Rio de Janeiro', country: 'BR'}],
  ['sa-santiago-1',{region:'Santiago', country: 'CL'}],
  ['sa-saopaulo-1',{region:'Sao Paulo', country: 'BR'}],
  ['sa-valparaiso-1',{region:'Valparaiso', country: 'CL'}],
  ['sa-vinhedo-1',{region:'Vinhedo', country: 'BR'}],
  ['uk-cardiff-1',{region:'Newport', country: 'GB'}],
  ['uk-london-1',{region:'London', country: 'GB'}],
  ['us-abilene-1',{region:'Abilene', country: 'US'}],
  ['us-ashburn-1',{region:'Ashburn', country: 'US'}],
  ['us-boardman-1',{region:'Boardman', country: 'US'}],
  ['us-chicago-1',{region:'Chicago', country: 'US'}],
  ['us-dallas-1',{region:'Dallas', country: 'US'}],
  ['us-desmoines-1',{region:'Des Moines', country: 'US'}],
  ['us-lenexa-1',{region:'Lenexa', country: 'US'}],
  ['us-phoenix-1',{region:'Phoenix', country: 'US'}],
  ['us-quincy-1',{region:'Quincy', country: 'US'}],
  ['us-saltlake-2',{region:'Salt Lake City', country: 'US'}],
  ['us-sanjose-1',{region:'San Jose', country: 'US'}],
  ['us-shawnee-1',{region:'Shawnee', country: 'US'}],
])

module.exports = async function getOracle() {
    const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    const json = await (await fetch('https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json', { maxRedirects: 10 })).json()
    for (const entry of json?.regions ?? []) {
      const regionInfo = regionMap.get(entry.region)
      const services = [...new Set(entry.cidrs.flatMap(cidr => cidr.tags))]
      for (const service of services) {
        ips.set(`${entry.region}_${service}`, {
        cloud: 'Oracle',
        region: regionInfo?.region || null,
        country: regionInfo?.country || null,
        regionId: entry.region,
        service,
        addressesv4: entry.cidrs.filter(cidr => cidr.cidr.includes('.') && cidr.tags.includes(service)).map(cidr => cidr.cidr),
        addressesv6: entry.cidrs.filter(cidr => cidr.cidr.includes(':') && cidr.tags.includes(service)).map(cidr => cidr.cidr)
        })
      }
    }
  } catch (error) {
    console.error(`Oracle error: ${error}`)
  }
  return Array.from(ips.values())
}
