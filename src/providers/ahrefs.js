const {isValid, isValidCIDR, parseCIDR} = require('ipaddr.js')

function ipv4ToInt(ip) {
  return ip.split('.').reduce((num, octet) => (num * 256n) + BigInt(octet), 0n)
}

function intToIpv4(num) {
  return [
    Number((num >> 24n) & 255n),
    Number((num >> 16n) & 255n),
    Number((num >> 8n) & 255n),
    Number(num & 255n)
  ].join('.')
}

function rangeToCidrs(start, end) {
  const cidrs = []
  while (start <= end) {
    let blockSize = start === 0n ? 1n << 32n : start & -start
    const remaining = end - start + 1n
    while (blockSize > remaining) blockSize >>= 1n
    cidrs.push(`${intToIpv4(start)}/${32 - Math.log2(Number(blockSize))}`)
    start += blockSize
  }
  return cidrs
}

function compactIpv4(ips) {
  const numbers = Array.from(new Set(ips.map(ipv4ToInt))).sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  const cidrs = []
  let start = numbers[0]
  let previous = numbers[0]
  for (const current of numbers.slice(1)) {
    if (current === previous + 1n) {
      previous = current
      continue
    }
    cidrs.push(...rangeToCidrs(start, previous))
    start = current
    previous = current
  }
  if (numbers.length > 0) cidrs.push(...rangeToCidrs(start, previous))
  return cidrs
}

module.exports = async function getAhrefs() {
  try {
    const json = await fetch('https://api.ahrefs.com/v3/public/crawler-ips').then(res => res.json())
    const ipv4 = []
    const ipv6 = []
    for (const entry of json.ips ?? []) {
      const ip = entry.ip_address
      if (!ip || !isValid(ip)) continue
      if (ip.includes('.')) ipv4.push(ip)
      if (ip.includes(':')) ipv6.push(`${ip}/128`)
    }
    const cidrs = [...compactIpv4(ipv4), ...ipv6].filter(isValidCIDR)
    if (cidrs.length === 0) return []
    return [{
      provider: 'Ahrefs',
      type: ['saas'],
      service: ['crawler'],
      addressesv4: cidrs.filter(cidr => cidr.includes('.')).map(cidr => parseCIDR(cidr)),
      addressesv6: cidrs.filter(cidr => cidr.includes(':')).map(cidr => parseCIDR(cidr)),
    }]
  } catch (error) {
    console.error(`Ahrefs error: ${error}`)
  }
}
