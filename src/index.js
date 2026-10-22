function createNode () {
    return { children: [], entries: []}
}

function buildIndex (records) {
    const roots = {
        ipv4: createNode(),
        ipv6: createNode()
    }
    let order = 0

    for (const record of records) {
        for (const field of ['addressesv4', 'addressesv6']) {
            for (const cidr of record[field]) {
                const [address, prefixLength] = cidr
                const bytes = address.toByteArray()

                let node = roots[address.kind()]
                for (let i = 0; i < prefixLength; i++) {
                    const bit = (bytes[i >> 3] >> (7 - (i & 7))) & 1
                    node.children[bit] ??= createNode()
                    node = node.children[bit]
                }

                node.entries.push({ record, field, cidr, order: order++ })
            }
        }
    }
    return roots
}

function findCandidates (index, address, allowedRecords) {
    const bytes = address.toByteArray()
    let node = index[address.kind()]
    const entries = [...node.entries]

    for (let i = 0; i < bytes.length * 8; i++) {
        const bit = (bytes[i >> 3] >> (7 - (i & 7))) & 1
        node = node.children[bit]

        if (!node) break

        entries.push(...node.entries)
    }

    entries.sort((a, b) => a.order - b.order)

    const allowed = allowedRecords ? new Set(allowedRecords) : null
    const candidates = new Map()

    for (const { record, field, cidr } of entries) {
        if (allowed && !allowed.has(record)) continue

        let candidate = candidates.get(record)

        if (!candidate) {
            candidate = {
                ...record,
                addressesv4: [],
                addressesv6: []
            }
            candidates.set(record, candidate)
        }

        candidate[field].push(cidr)
    }

    return [...candidates.values()]
}

module.exports = { buildIndex, findCandidates }