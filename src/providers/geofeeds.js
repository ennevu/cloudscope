const papa = require('papaparse')
const gFeeds = new Map([
  ['elastx', { url: 'https://data-source.elastx.cloud/geofeed.csv', name: 'Elastx' }],
  ['hetzner', { url: 'https://www.hetzner.com/geofeed.csv', name: 'Hetzner' }],
  ['eurohoster', { url: 'https://eurohoster.org/geofeeds.csv', name: 'EuroHoster' }],
  ['hostealo', { url: 'https://hostealo.es/geofeed.csv', name: 'Hostealo' }],
  ['zappiehost', { url: 'https://zappiehost.com/geofeeds.csv', name: 'ZappieHost' }],
  ['hosthatch', { url: 'https://hosthatch.com/geofeed', name: 'HostHatch' }],
  ['pumpcloud', { url: 'https://pumpcloud.net/ip.csv', name: 'PumpCloud' }],
  ['kaopucloud', { url: 'https://www.kaopucloud.com/geofeed.csv', name: 'Kaopu Cloud' }],
  ['cloudcomtr', { url: 'https://cloud.com.tr/geofeed/geofeed.csv', name: 'Cloud.com.tr' }],
  ['crowncloud', { url: 'https://crowncloud.net/geofeed.csv', name: 'CrownCloud' }],
  ['mikicloud', { url: 'https://mikucloud.co/geofeed.csv', name: 'Miku Cloud' }],
  ['gthost', { url: 'https://lg-tor.gthost.com/geo-feed.csv', name: 'GT Host' }],
  ['lowhosting', { url: 'https://lowhosting.com/geofeed.csv', name: 'Low Hosting' }],
  ['mathost', { url: 'https://mathost.eu/geofeeds.csv', name: 'MatHost' }],
  ['mchost', { url: 'https://mchost.com/geofeed.csv', name: 'McHost' }],
  ['mclouds', { url: 'https://mclouds.ru/geofeed.csv', name: 'MClouds.ru' }],
  ['halocloud', { url: 'https://pan.halocloud.net/?f=/geofeed.csv', name: 'Halo Cloud' }],
  ['rarecloud', { url: 'https://rarecloud.io/geofeed.csv', name: 'Rare Cloud' }],
  ['jinxcloud', { url: 'https://geofeed.jinx.cloud/geofeed.csv', name: 'Jinx Cloud' }],
  ['xtom', { url: 'https://geofeed.xtom.de/files/as-xtom.csv', name: 'xTom' }],
  ['akile', { url: 'https://geofeed.akile.io/geofeed.csv', name: 'Akile Cloud' }],
  ['vecloud', { url: 'https://en.vecloud.com/apnic/geofeed/geofeed.csv', name: 'VeCloud' }],
  ['hostbilby', { url: 'https://hostbilby.com/geofeed.csv', name: 'HostBilby' }],
  ['hostglobal', { url: 'https://hostglobal.plus/geofeeds.csv', name: 'HostGlobal' }],
  ['kamatera', { url: 'https://www.kamatera.com/geofeed.csv', name: 'Kamatera' }],
  ['gcore', { url: 'https://geofeed.gcore.lu/IP-Range.csv', name: 'GCore' }],
  ['contabo', { url: 'http://geofeed.contabo.de/geofeed.csv', name: 'Contabo' }],
  ['timeweb', { url: 'https://geofeed.timeweb.net/geofeed.csv', name: 'TimeWeb' }],
  ['seasoncloud', { url: 'https://cdn.seasoncloud.com.br/geofeed/geofeed.csv', name: 'Season Cloud' }],
  ['datalix', { url: 'https://datalix.de/.well-known/geofeed.csv', name: 'DataLix' }],
  ['c1vhosting', { url: 'https://www.c1vhosting.it/geofeed.csv', name: 'C1V Hosting' }],
  ['3hcloud', { url: 'http://geofeed.3hcloud.com/geofeed.csv', name: '3H Cloud' }],
  ['cloudzy', { url: 'https://api.cloudzy.com/geofeed.csv', name: 'Cloudzy' }],
  ['cloud225', { url: 'https://cloud225.net/geofeed.csv', name: 'Cloud225' }],
  ['cloudnet', { url: 'https://cloudnet.ca/geofeed.txt', name: 'CloudNet' }],
  ['sejacloud', { url: 'http://sejacloud.com/geofeed.csv', name: 'Seja Cloud' }],
  ['letscloud', { url: 'https://geofeed.letscloud.io', name: 'Lets Cloud' }],
  ['maikiwi', { url: 'https://geofeed.mai.kiwi/', name: 'Maikiwi' }],
  ['serverside', { url: 'https://geofeed.serverside.com/geofeed.csv', name: 'Serverside' }],
  ['mycloud', { url: 'https://mycloud.uz/geofeed.csv', name: 'MyCloud' }],
  ['mymisaka', { url: 'https://www.mymisaka.net/feed.csv', name: 'MyMisaka' }],
  ['railway', { url: 'https://geofeed.railway.com', name: 'Railway' }],
  ['csti', { url: 'https://csti.ch/geofeed.csv', name: 'CSTI' }],
  ['seeweb', { url: 'https://www.as12637.net/geofeed.csv', name: 'SeeWeb' }],
  ['axera', { url: 'https://as13097.net/geofeed/geofeed.csv', name: 'Axera' }],
  ['hostinger', { url: 'https://raw.githubusercontent.com/hostinger/geofeed/main/geofeed.csv', name: 'Hostinger' }],
  ['62yun', { url:'https://62yun.co/geofeed.csv', name: '62Yun' }],
  ['dedcloud', { url: 'https://dedcloud.com/api/geofeed.csv', name: 'DedCloud' }],
  ['fastly', { url: 'https://ip-geolocation.fastly.com/', name: 'Fastly' }],
  ['rapidseedbox', { url: 'https://geofeed.rapidseedbox.com/geofeed.csv', name: 'RapidSeedbox' }],
  ['dynanode', { url: 'https://dynanode.io/geofeed.txt', name: 'DynaNode' }],
  ['cherryservers', { url: 'https://geofeed.cherryservers.com/geofeed.csv', name: 'Cherry Servers' }],

])
async function getGeofeed(id) {
  const ips = new Map()
  try {
    const { url, name } = gFeeds.get(id) || {}
    const csv = await (await fetch(url, { maxRedirects: 10 })).text()
    const rows = papa.parse(csv, { comments: '#' }).data
    for (const entry of rows) {
      if (entry[0] === 'ip_range' || entry[0] === 'network' || entry[0] === 'prefix') continue
      const prefix = entry[0]
      const country = entry[1]
      const regionId = entry[2]
      const city = entry[3]
      const region = city || regionId || country
      if (!prefix || !region) continue

      const key = `${country || ''}|${regionId || ''}|${region}`
      if (ips.has(key)) {
        prefix.includes('.') ? ips.get(key).addressesv4.push(prefix) : ips.get(key).addressesv6.push(prefix)
      } else {
        const isAnycastRegion = region.toLowerCase() === 'anycast'
        const isAnycastCountry = country?.toLowerCase() === 'anycast'
        ips.set(key, {
          cloud: name,
          region: isAnycastRegion ? 'Global' : region,
          country: isAnycastCountry ? null : country,
          regionId: regionId?.toLowerCase() === 'anycast' ? 'global' : regionId || region,
          service: null,
          addressesv4: prefix.includes('.') ? [prefix] : [],
          addressesv6: prefix.includes(':') ? [prefix] : []
        })
      }
    }
  } catch (error) {
    console.error(`${error.message}`)
  }
  return Array.from(ips.values())
}

module.exports = { getGeofeed, gFeeds }
