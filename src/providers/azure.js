const cheerio = require('cheerio')
  const regionMap = new Map([
    ['global',{region:'Global', country: null}],
    ['australiacentral',{region:'Canberra', country: 'AU'}],
    ['australiacentral2',{region:'Canberra', country: 'AU'}],
    ['australiaeast',{region:'New South Wales', country: 'AU'}],
    ['australiasoutheast',{region:'Victoria', country: 'AU'}],
    ['austriaeast',{region:'Vienna', country: 'AT'}],
    ['belgiumcentral',{region:'Brussels', country: 'BE'}],
    ['brazilsouth',{region:'Sao Paulo State', country: 'BR'}],
    ['brazilsoutheast',{region:'Rio de Janeiro', country: 'BR'}],
    ['brazilse',{region:'Rio de Janeiro', country: 'BR'}],
    ['canadacentral',{region:'Toronto', country: 'CA'}],
    ['canadaeast',{region:'Quebec', country: 'CA'}],
    ['centralindia',{region:'Pune', country: 'IN'}],
    ['centralus',{region:'Iowa', country: 'US'}],
    ['centraluseuap', {region:'Des Moines', country: 'US'}],
    ['chilecentral',{region:'Santiago de Chile', country: 'CL'}],
    ['chilec',{region:'Santiago de Chile', country: 'CL'}],
    ['denmarkeast',{region:'Copenhagen', country: 'DK'}],
    ['eastasia',{region:'Hong Kong SAR', country: 'HK'}],
    ['eastus',{region:'Virginia', country: 'US'}],
    ['eastus2',{region:'Virginia', country: 'US'}],
    ['eastus3',{region:'Atlanta', country: 'US'}],
    ['eastus2euap',{region:'Virginia', country: 'US'}],
    ['francecentral',{region:'Paris', country: 'FR'}],
    ['francesouth',{region:'Marseille', country: 'FR'}],
    ['centralfrance',{region:'Paris', country: 'FR'}],
    ['southfrance',{region:'Marseille', country: 'FR'}],
    ['germanynorth',{region:'Berlin', country: 'DE'}],
    ['germanywestcentral',{region:'Frankfurt', country: 'DE'}],
    ['germanyn',{region:'Berlin', country: 'DE'}],
    ['germanywc',{region:'Frankfurt', country: 'DE'}],
    ['indonesiacentral',{region:'Jakarta', country: 'ID'}],
    ['israelcentral',{region:'Tel Aviv', country: 'IL'}],
    ['israelnorthwest', {region:'Tel Aviv', country: 'IL'}],
    ['italynorth',{region:'Milan', country: 'IT'}],
    ['japaneast',{region:'Tokyo, Saitama', country: 'JP'}],
    ['japanwest',{region:'Osaka', country: 'JP'}],
    ['jioindiacentral',{region:'Nagpur', country: 'IN'}],
    ['jioindiawest',{region:'Jamnagar', country: 'IN'}],
    ['koreacentral',{region:'Seoul', country: 'KR'}],
    ['koreasouth',{region:'Busan', country: 'KR'}],
    ['malaysiasouth',{region:'Johor Bahru', country: 'MY'}],
    ['malaysiawest',{region:'Kuala Lumpur', country: 'MY'}],
    ['mexicocentral',{region:'Querétaro State', country: 'MX'}],
    ['newzealandnorth',{region:'Auckland', country: 'NZ'}],
    ['northcentralus',{region:'Illinois', country: 'US'}],
    ['northeurope',{region:'Ireland', country: 'IE'}],
    ['norwayeast',{region:'Norway', country: 'NO'}],
    ['norwaywest',{region:'Norway', country: 'NO'}],
    ['norwaye',{region:'Norway', country: 'NO'}],
    ['norwayw',{region:'Norway', country: 'NO'}],
    ['polandcentral',{region:'Warsaw', country: 'PL'}],
    ['qatarcentral',{region:'Doha', country: 'QA'}],
    ['southafricanorth',{region:'Johannesburg', country: 'ZA'}],
    ['southafricawest',{region:'Cape Town', country: 'ZA'}],
    ['southindia',{region:'Chennai', country: 'IN'}],
    ['southeastasia',{region:'Singapore', country: 'SG'}],
    ['spaincentral',{region:'Madrid', country: 'ES'}],
    ['swedencentral',{region:'Gävle', country: 'SE'}],
    ['swedensouth',{region:'Malmö', country: 'SE'}],
    ['switzerlandnorth',{region:'Zurich', country: 'CH'}],
    ['switzerlandwest',{region:'Geneva', country: 'CH'}],
    ['switzerlandn',{region:'Zurich', country: 'CH'}],
    ['switzerlandw',{region:'Geneva', country: 'CH'}],
    ['uaecentral',{region:'Abu Dhabi', country: 'AE'}],
    ['uaenorth',{region:'Dubai', country: 'AE'}],
    ['uksouth',{region:'London', country: 'GB'}],
    ['ukwest',{region:'Cardiff', country: 'GB'}],
    ['westcentralus',{region:'Wyoming', country: 'US'}],
    ['westeurope',{region:'Netherlands', country: 'NL'}],
    ['westindia',{region:'Mumbai', country: 'IN'}],
    ['westus',{region:'California', country: 'US'}],
    ['westus2',{region:'Washington', country: 'US'}],
    ['westus3',{region:'Phoenix', country: 'US'}],
    ['southeastus',{region:'Dallas', country: 'US'}],
    ['taiwannorth',{region:'Taipei', country: 'TW'}],
    ['taiwannorthwest',{region:'Taipei', country: 'TW'}],
    ['usstagec',{region:'Washington', country: 'US'}],
    ['usstagee',{region:'Independence', country: 'US'}],
    ['southcentralus',{region:'Dallas', country: 'US'}],
    ['southcentralus2',{region:'Dallas', country: 'US'}],
    ['southeastus3',{region:'Richmond', country: 'US'}],
  ])

module.exports = async function getAzure() {
    const ips = new Map()
    try {
        // For Microsoft the json download link changes daily, so we need to scrape the download page to get the latest link
        const page = await(await fetch('https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519', { maxRedirects: 10 })).text()
        const $ = cheerio.load(page)
        const downloadLinkElement = $('a.dlcdetail__download-btn[href*="download.microsoft.com/download/"]')
        if (!downloadLinkElement.length) {
            throw new Error('Download link not found in the page')
        }
        const downloadUrl = downloadLinkElement.attr('href')
        const json = await (await fetch(downloadUrl, { maxRedirects: 10 })).json()
        for (const entry of json?.values ?? []) {
            ips.set(`${entry.properties.region}_${entry.properties.systemService}`, {
                cloud: entry.properties.platform,
                regionId: entry.properties.region && entry.properties.region.length > 0 ? entry.properties.region : null,
                region: regionMap.get(entry.properties.region)?.region || null,
                country: regionMap.get(entry.properties.region)?.country || null,
                service: entry.properties.systemService && entry.properties.systemService.length > 0 ? entry.properties.systemService : null,
                addressesv4: entry.properties.addressPrefixes.filter(cidr => cidr.includes('.')),
                addressesv6: entry.properties.addressPrefixes.filter(cidr => cidr.includes(':'))
            })
        }   
    } catch (error) {
        console.error(`Azure error: ${error.message}`)
    }
    return Array.from(ips.values())
}