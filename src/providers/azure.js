const cheerio = require('cheerio')
  const regionMap = new Map([
    ['global','Global'],
    ['australiacentral','Canberra'],
    ['australiacentral2','Canberra'],
    ['australiaeast','New South Wales'],
    ['australiasoutheast','Victoria'],
    ['austriaeast','Vienna'],
    ['belgiumcentral','Brussels'],
    ['brazilsouth','Sao Paulo State'],
    ['brazilsoutheast','Rio de Janeiro'],
    ['brazilse','Rio de Janeiro'],
    ['canadacentral','Toronto'],
    ['canadaeast','Quebec'],
    ['centralindia','Pune'],
    ['centralus','Iowa'],
    ['centraluseuap', 'Des Moines'],
    ['chilecentral','Santiago de Chile'],
    ['chilec','Santiago de Chile'],
    ['denmarkeast','Copenhagen'],
    ['eastasia','Hong Kong SAR'],
    ['eastus','Virginia'],
    ['eastus2','Virginia'],
    ['eastus3','Atlanta'],
    ['eastus2euap','Virginia'],
    ['francecentral','Paris'],
    ['francesouth','Marseille'],
    ['centralfrance','Paris'],
    ['southfrance','Marseille'],
    ['germanynorth','Berlin'],
    ['germanywestcentral','Frankfurt'],
    ['germanyn','Berlin'],
    ['germanywc','Frankfurt'],
    ['indonesiacentral','Jakarta'],
    ['israelcentral','Tel Aviv'],
    ['israelnorthwest', 'Tel Aviv'],
    ['italynorth','Milan'],
    ['japaneast','Tokyo, Saitama'],
    ['japanwest','Osaka'],
    ['jioindiacentral','Nagpur'],
    ['jioindiawest','Jamnagar'],
    ['koreacentral','Seoul'],
    ['koreasouth','Busan'],
    ['malaysiasouth','Johor Bahru'],
    ['malaysiawest','Kuala Lumpur'],
    ['mexicocentral','Querétaro State'],
    ['newzealandnorth','Auckland'],
    ['northcentralus','Illinois'],
    ['northeurope','Ireland'],
    ['norwayeast','Norway'],
    ['norwaywest','Norway'],
    ['norwaye','Norway'],
    ['norwayw','Norway'],
    ['polandcentral','Warsaw'],
    ['qatarcentral','Doha'],
    ['southafricanorth','Johannesburg'],
    ['southafricawest','Cape Town'],
    ['southindia','Chennai'],
    ['southeastasia','Singapore'],
    ['spaincentral','Madrid'],
    ['swedencentral','Gävle'],
    ['swedensouth','Malmö'],
    ['switzerlandnorth','Zurich'],
    ['switzerlandwest','Geneva'],
    ['switzerlandn','Zurich'],
    ['switzerlandw','Geneva'],
    ['uaecentral','Abu Dhabi'],
    ['uaenorth','Dubai'],
    ['uksouth','London'],
    ['ukwest','Cardiff'],
    ['westcentralus','Wyoming'],
    ['westeurope','Netherlands'],
    ['westindia','Mumbai'],
    ['westus','California'],
    ['westus2','Washington'],
    ['westus3','Phoenix'],
    ['southeastus','Dallas'],
    ['taiwannorth','Taipei'],
    ['taiwannorthwest', 'Taipei'],
    ['usstagec','Washington'],
    ['usstagee','Independence'],
    ['southcentralus','Dallas'],
    ['southcentralus2','Dallas'],
    ['southeastus3','Richmond'],
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
                region: regionMap.get(entry.properties.region) || null,
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