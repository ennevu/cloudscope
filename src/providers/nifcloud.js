const axios = require('axios')
module.exports = async function getNifcloud() {
	const ips = new Map()
	try {
		const json = (await axios.get('https://pfs.nifcloud.com/pdf/ip_ranges.json', { maxRedirects: 10 })).data
		for (const entry of json.prefixes) {
			if (ips.has(entry.region)) {
				entry.ip_prefix.includes('.') ? ips.get(entry.region).addressesv4.push(entry.ip_prefix) : null
				entry.ip_prefix.includes(':') ? ips.get(entry.region).addressesv6.push(entry.ip_prefix) : null
			} else {
				ips.set(entry.region, {
					cloud: 'NIFCloud',
          region: null,
          regionId: entry.region,
          service: null,
          addressesv4: entry.ip_prefix.includes('.') ? [entry.ip_prefix] : [],
          addressesv6: entry.ip_prefix.includes(':') ? [entry.ip_prefix] : []
				})
			}
		}
	} catch (error) {
		console.error(`NIFCloud error: ${error}`)
	}

	return Array.from(ips.values())

}
