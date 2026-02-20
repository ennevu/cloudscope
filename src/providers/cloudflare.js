
module.exports = async function getCloudflare() {
  const ips = new Map()
  try {
    // Get the JSON data of IP ranges
    let txtv4 = (await (await fetch('https://www.cloudflare.com/ips-v4', { maxRedirects: 10 })).text())
    let txtv6 = (await (await fetch('https://www.cloudflare.com/ips-v6', { maxRedirects: 10 })).text())
    const txt = txtv4 + '\n' + txtv6
    const rows = txt.split('\n').filter(Boolean)
    for (const entry of rows) {
      if (ips.has('global')) {
        entry.includes('.') ? ips.get('global').addressesv4.push(entry) : ips.get('global').addressesv6.push(entry)
      } else {
        ips.set('global', {
          cloud: 'Cloudflare',
          region: 'Global',
          regionId:'global',
          service: null,
          addressesv4: entry.includes('.') ? [entry] : [],
          addressesv6: entry.includes(':') ? [entry] : []
        })
      }
    }
  } catch (error) {
    console.error(`Cloudflare error: ${error}`)
  }

  return Array.from(ips.values())
}