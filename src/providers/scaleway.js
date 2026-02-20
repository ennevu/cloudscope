const cheerio = require('cheerio')

module.exports = async function getScaleway() {
	/** Helpers **/
	const isIp = (t) => t.includes('.') || t.includes(':')

	const ips = new Map([
		['globalnull', {
			cloud: 'Scaleway',
			region: 'Global',
			regionId: 'global',
			service: null,
			addressesv4: [],
			addressesv6: []
		}]
	])

	try {
		const page = (await (await fetch('https://www.scaleway.com/en/docs/account/reference-content/scaleway-network-information/', { maxRedirects: 10 })).text())
		const $ = cheerio.load(page)

		/** ---------- IP ranges used by Scaleway (global IPv4/IPv6) ---------- */
		const $h2 = $('h2').filter((_, el) => /ip ranges used by scaleway/i.test($(el).text().trim())).first();
		if ($h2.length) {
			const $section = $h2.nextUntil('h2')

			// IPv4
			$section.find('h3:contains("IPv4") + ul code').each((_, el) => {
				const t = $(el).text().trim()
				if (isIp(t)){
					ips.get('globalnull').addressesv4.push(t)
				}
			})

			// IPv6
			$section.find('h3:contains("IPv6") + ul code').each((_, el) => {
				const t = $(el).text().trim()
				if (isIp(t)){
					ips.get('globalnull').addressesv6.push(t)
				}
			})
		}
	} catch (error) {
		console.error(`Scaleway error: ${error}`)
	}

	return Array.from(ips.values())
}
