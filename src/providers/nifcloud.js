const {isValidCIDR, parseCIDR} = require('ipaddr.js')
const regionMap = new Map([
	['jp-west-1',{region:'Osaka', country: 'JP'}],
	['jp-west-2',{region:'Osaka', country: 'JP'}],
	['jp-east-1',{region:'Tokyo', country: 'JP'}],
	['jp-east-2',{region:'Tokyo', country: 'JP'}],
	['jp-east-3',{region:'Tokyo', country: 'JP'}],
	['jp-east-4',{region:'Tokyo', country: 'JP'}],
])

module.exports = async function getNifcloud() {
	const ips = new Map()
	try {
		const json = await (await fetch('https://pfs.nifcloud.com/pdf/ip_ranges.json', { maxRedirects: 10 })).json()
		for (const entry of json.prefixes) {
			if (ips.has(entry.region)) {
				entry.ip_prefix.includes('.') ? ips.get(entry.region).addressesv4.push(parseCIDR(entry.ip_prefix)) : null
				entry.ip_prefix.includes(':') ? ips.get(entry.region).addressesv6.push(parseCIDR(entry.ip_prefix)) : null
			} else {
				ips.set(entry.region, {
					provider: 'NIFCloud',
					type:['cloud'],
					region: regionMap.get(entry.region)?.region || null,
					country: regionMap.get(entry.region)?.country || null,
					regionId: entry.region,
					service: null,
					addressesv4: entry.ip_prefix.includes('.') ? [parseCIDR(entry.ip_prefix)] : [],
					addressesv6: entry.ip_prefix.includes(':') ? [parseCIDR(entry.ip_prefix)] : []
				})
			}
		}
	} catch (error) {
		console.error(`NIFCloud error: ${error}`)
	}

	return Array.from(ips.values())

}
