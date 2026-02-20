const ipaddr = require('ipaddr.js')

function ipInCidr(ip, cidr) {
  try {
    const addr = ipaddr.parse(ip)
    const [rangeAddr, prefixLen] = ipaddr.parseCIDR(cidr)
    if (addr.kind() !== rangeAddr.kind()) return false
    return addr.match([rangeAddr, prefixLen])
  } catch {
    return false
  }
}

module.exports = { ipInCidr }
