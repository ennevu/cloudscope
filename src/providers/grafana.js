const {isValidCIDR, parseCIDR} = require('ipaddr.js')

const services = [
  'hosted-alerts',
  'hosted-grafana',
  'hosted-metrics',
  'hosted-traces',
  'hosted-logs',
  'hosted-profiles',
  'hosted-otlp'
]

module.exports = async function getGrafana() {
  const records = []
  for (const service of services) {
    try {
      const ranges = await fetch(`https://grafana.com/api/${service}/source-ips`).then(res => res.json())
      const cidrs = [...new Set(ranges)]
        .map(range => range.includes('/') ? range : `${range}/32`)
        .filter(isValidCIDR)
      if (cidrs.length === 0) continue
      records.push({
        provider: 'Grafana',
        type: ['saas'],
        service: [service],
        addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
        addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
      })
    } catch (error) {
      console.error(`Grafana ${service} error: ${error}`)
    }
  }
  return records
}
