# cloudscope
[![npm version](https://img.shields.io/npm/v/cloudscope.svg)](https://www.npmjs.com/package/cloudscope)
[![license](https://img.shields.io/npm/l/cloudscope.svg)](./LICENSE)
[![CI](https://github.com/ennevu/cloudscope/actions/workflows/ci.yml/badge.svg)](https://github.com/ennevu/cloudscope/actions/workflows/ci.yml)


**cloudscope** is a Node.js library to detect whether an IP address belongs to a cloud provider, CDN, hosting provider or supported SaaS/company range.
It fetches and normalizes CIDR ranges, then lets you check IPv4 and IPv6 addresses efficiently.

An IP can return multiple matches when it belongs to both the underlying infrastructure provider and the SaaS/company using that range.

---

## Features

* Detect if an IP belongs to a **cloud provider**, **CDN**, **hosting provider** or supported **SaaS/company**
* Supports **IPv4** and **IPv6**
* Cached loading with configurable TTL
* Filter by provider, service, region or ISO3166 country code
* Return multiple matches for the same IP when more than one source applies

---

## Supported Providers

| Country/Region      | Providers                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------|
| USA                 | AWS, Azure, Google Cloud, IBM, DigitalOcean, Linode, Oracle, Vultr, Cloudflare, HostHatch, GTHost, Kamatera, Contabo, Railway, HostGlobal, HostBilby, MyCloud, MyMisaka, Serverside, LetsCloud, Cloudzy, SeasonCloud, RareCloud, HaloCloud, Mathost, MCHost, MClouds, PumpCloud, LowHosting, ZappieHost, CrownCloud, CloudNet, Axera, Fastly, DynaNode |
| Asia                | Aliyun (China), KaopuCloud (China), JinXCloud (China), 62Yun, NIFCloud (Japan), Mikicloud (Japan)                                                              |
| Europe              | Scaleway (France), Exoscale (Switzerland), Hetzner (Germany), Aruba (Italy), EuroHoster (Bulgaria), Seeweb (Italy), Timeweb (Russia), Gcore (Luxembourg), Datalix (Netherlands), 3HCloud (Russia), C1VHosting (Netherlands), Maikiwi (Netherlands), SejaCloud (Portugal), CloudComTR (Turkey), Akile (France), VeCloud (France), Hostealo (Spain), HostGlobal (Germany), MCHost (Russia), Mathost (Russia), MClouds (Russia), SeasonCloud (Russia), RareCloud (Russia), HaloCloud (Russia), CloudNet (Germany), Axera (France), CSTI (Switzerland), Hostealo (Spain), Hostinger, DedCloud, Cherry Servers, RapidSeedbox |
| Australia           | HostBilby                                                                                   |
| Brazil              | LetsCloud                                                                                   |
| India               | HostGlobal                                                                                  |
| Africa              | Cloud225 (Ivory Coast)                                                                      |

*Note: Some providers operate globally or in multiple regions. This table lists their primary country or region of origin where applicable.*

## Supported Companies

| Scope               | Companies                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------|
| Global              | DataDog, GitHub, Terraform, CircleCI, Zendesk, Okta, Grafana                                |

Companies are loaded with the `companies` option in `load()`.

---

## Install

```bash
npm install cloudscope
# or
yarn add cloudscope
```

---

## Migrating from 0.2.x

### API changes

Successful `isIp()` lookups now return a `matches` array. Fields such as `provider`, `country`, `regionId`, `service` and `cidr` must be read from `result.matches[n]` instead of the top-level result object.

```js
// 0.2.x
result.provider
result.cidr

// 0.3.x
result.matches[0].provider
result.matches[0].cidr
```

`service` is now `string[] | null`, because a single range can expose multiple services. `load()` also accepts `companies` to include SaaS/company datasets.

### Lookup performance

Version `0.3.x` parses CIDR ranges once during loading with `ipaddr.js` and reuses those parsed ranges during IP checks. Version `0.2.x` parsed CIDRs during each lookup.

Local benchmark: 1000 generated IP checks against Cloudflare.

| Version | Total time | Time / IP checked |
|---------|------------|-------------------|
| `0.2.4` | 218.68 ms  | 0.2187 ms/IP      |
| `0.3.x` | 2.31 ms    | 0.0023 ms/IP      |

This benchmark showed a 98.94% reduction in lookup time.

---

## Usage

```js
const { load, isIp, getData, refresh, exportData } = require('cloudscope');

(async () => {
  // 1. Load data from providers and companies (cached in memory)
  await load({
    ttlMs: 1000 * 60 * 60 * 12,
    providers: ['aws'],
    companies: ['datadog']
  }); // cache = 12h

  // 2. Check an IP
  const result = isIp('13.244.85.86');

  if (result.match) {
    console.log(`Cloud IP detected!`);
    console.log(result.matches);
  } else {
    console.log(`Not a cloud IP`);
  }

  // 3. Restrict by provider
  const awsCheck = isIp('15.230.39.1', { provider: 'Amazon' });
  console.log(awsCheck);

  // 4. Restrict by single country
  const usCheck = isIp('15.230.39.1', { country:'US'});
  console.log(usCheck);

  // 5. Restrict by multiple countries
   const euCheck = isIp('15.230.39.1', { country:['IT', 'DE', 'FR', 'GB']})
   console.log(euCheck);

  // 6. Or a combination of the above
  const specialCheck = isIp('15.230.39.1', {country:'US', provider: 'Amazon', regionId:'us-east-2'})
  console.log(specialCheck);

  // 7. Get dataset summary
  console.log(getData());

  // 8. Force refresh
  await refresh();

  // 9. Export the Data
  const db = exportData();
})();
```

---

## API

### `await load(options?: LoadOptions)`

Loads IP ranges from supported cloud providers and companies into memory.
Uses an in-memory cache with configurable TTL.

**Options (`LoadOptions`):**

* `providers` *(string\[])* → list of providers to load (default: all)
* `companies` *(string\[])* → list of companies/SaaS datasets to load (default: all)
* `ttlMs` *(number)* → cache TTL in milliseconds (default: 6h)
* `force` *(boolean)* → ignore cache freshness and force reload

**Returns:**

```js
{ loadedAt: number, count: number }
```

---

### `isIp(ip: string, options?: IsIpOptions)`

Checks whether an IPv4 or IPv6 address belongs to a known provider or company range.

**Parameters:**

* `ip` *(string)* → IP address to check
* `options` *(IsIpOptions)* (optional)

  * `provider` → restrict to a specific provider/company (e.g., "Amazon", "Microsoft", "DataDog")
  * `service` → restrict to a specific service (if available)
  * `regionId` → restrict to a specific region identifier (e.g., "eu-west-1")
  * `country` → restrict to a specific country or a list of countries (e.g., "US" or ["US", "IT", "DE"])

**Returns (`IsIpResult`):**

```js
{
  match: true,
  matches: [
    {
      version: 'ipv4',
      provider: string,
      type: string[],
      country?: string|null,
      regionId?: string,
      region?: string|null,
      service: string[]|null,
      cidr: string
    }
  ]
}
```

When no range matches:

```js
{
  match: false,
  reason?: 'invalid_ip' | 'provider_not_loaded' | 'data_not_loaded'
}
```

---

### `getData(): DataSummary`

Returns a lightweight summary of the in-memory dataset.

**Returns:**

```js
{
  loadedAt: number|null,   // when data was last loaded
  ttlMs: number,           // cache TTL
  count: number,           // number of records in memory
  providers: string[]      // list of available providers
}
```

---

### `await refresh()`

Forces a reload of all provider ranges, ignoring cache.

**Returns:**

```js
{ loadedAt: number, count: number }
```

### `exportData(): ExportedRecord[]`
Returns the normalized in-memory dataset

**Returns:**

```js
[
  { provider: string,
    type: string[],
    regionId?: string | null,
    region?: string | null,
    country?: string | null,
    service: string[] | null,
    addressesv4: [string],
    addressesv6: [string]
   }
]
```

## Use cases

* **Security logging**: enrich logs with provider info
* **Firewall / WAF rules**: detect and allow/deny traffic from clouds
* **Analytics**: categorize requests by hosting provider
* **Geolocation**: improve IP intelligence with cloud-awareness

---

## License

MIT © Nicolò Vattai
