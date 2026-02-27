const papa = require('papaparse')

module.exports = async function getAruba() {
  const ips = new Map()
  const cityMap = new Map()
  try {
    // Geofeed contains wrong country to city mapping (come rows contain wrong city but correct country)
    let csv = (await (await fetch('https://geoloc.aruba.it/geo.csv', { maxRedirects: 10 })).text())
    const rows = papa.parse(csv).data
    //PATCH
    for (const entry of rows) {
        if (entry[1] === 'IT' && entry[3]=== 'Prague') entry[3] = 'Arezzo'
        if (entry[1] === 'CZ' && entry[3]=== 'Saint-Denis') entry[3] = 'Prague'
        if (entry[1] === 'FR' && entry[3]=== 'Frankfurt am Main') entry[3] = 'Saint-Denis'
        if (entry[1] === 'DE' && entry[3]=== 'Slough') entry[3] = 'Frankfurt am Main'
        if (entry[1] === 'GB' && entry[3]=== 'Warsaw') entry[3] = 'Slough'
        if (entry[1] === 'PL' && entry[3]=== 'Ponte San Pietro') entry[3] = 'Warsaw'
    }

    for (const entry of rows) {
      if (ips.has(entry[3])) {
        entry[0].includes('.') ? ips.get(entry[3]).addressesv4.push(entry[0]) : ips.get(entry[3]).addressesv6.push(entry[0])
      } else if (entry[3]) {
        ips.set(entry[3], {
          cloud: 'Aruba Cloud',
          region: entry[3]?.trim(),
          country: entry[1],
          regionId: entry[2],
          service: null,
          addressesv4: entry[0].includes('.') ? [entry[0]] : [],
          addressesv6: entry[0].includes(':') ? [entry[0]] : []
        })
      }
    }
  } catch (error) {
    console.error(`Aruba error: ${error}`)
  }

  return Array.from(ips.values())
}
