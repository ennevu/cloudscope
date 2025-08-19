const axios = require('axios')
const cheerio = require('cheerio')
module.exports = async function getAzure() {
    const ips = new Map()
    try {
        // For Microsoft the json download link changes daily, so we need to scrape the download page to get the latest link
        const page = await axios.get('https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519', { maxRedirects: 10 })
        const $ = cheerio.load(page.data)
        const downloadLinkElement = $('a.dlcdetail__download-btn[href*="download.microsoft.com/download/"]')
        if (!downloadLinkElement.length) {
            throw new Error('Download link not found in the page')
        }
        const downloadUrl = downloadLinkElement.attr('href')
        const json = (await axios.get(downloadUrl, { maxRedirects: 10 })).data
        for (const entry of json?.values ?? []) {
            ips.set(`${entry.properties.region}_${entry.properties.systemService}`, {
                cloud: entry.properties.platform,
                regionId: entry.properties.region && entry.properties.region.length > 0 ? entry.properties.region : "global",
                region: null,
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