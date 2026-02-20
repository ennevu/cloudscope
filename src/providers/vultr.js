  module.exports = async function getVultr() {
  const ips = new Map()
  try {
    const json = await (await fetch("https://geofeed.constant.com/?json", { maxRedirects: 10 })).json()
    for (const entry of json?.subnets ?? []) {
      if (ips.has(entry.region)) {
        entry.ip_prefix.includes('.') ? ips.get(entry.region).addressesv4.push(entry.ip_prefix) : null
        entry.ip_prefix.includes(':') ? ips.get(entry.region).addressesv6.push(entry.ip_prefix) : null
      } else {
        ips.set(entry.region, {
          cloud: 'Vultr',
          region: entry.city,
          regionId: entry.region,
          service: null,
          addressesv4: entry.ip_prefix.includes('.') ? [entry.ip_prefix] : [],
          addressesv6: entry.ip_prefix.includes(':') ? [entry.ip_prefix] : []
        })
      }
    }
  } catch (error) {
    console.error(`Vultr error: ${error}`)
  }
  return Array.from(ips.values())
}