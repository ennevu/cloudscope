# cloudscope

[![npm version](https://img.shields.io/npm/v/cloudscope.svg)](https://www.npmjs.com/package/cloudscope)
[![license](https://img.shields.io/npm/l/cloudscope.svg)](./LICENSE)

**cloudscope** is a Node.js library to detect whether an IP address belongs to a major cloud provider.
It fetches and normalizes CIDR ranges, then lets you check IPv4 and IPv6 addresses efficiently.

---

## ✨ Features

* Detect if an IP belongs to a **cloud provider**
* Supports **IPv4** and **IPv6**
* Providers supported:
  AWS, Azure, Google Cloud, Oracle, IBM, DigitalOcean, Linode, Exoscale, Vultr, Scaleway, NIFCloud
* Cached loading with configurable TTL
* Filter by provider, service, or region

---

## 🚀 Install

```bash
npm install cloudscope
# or
yarn add cloudscope
```

---

## 📖 Usage

```js
const { load, isIp, getData, refresh } = require('cloudscope');

(async () => {
  // 1. Load data from providers (cached in memory)
  await load({ ttlMs: 1000 * 60 * 60 * 12 }); // cache = 12h

  // 2. Check an IP
  const result = await isIp('52.95.110.1');

  if (result.match) {
    console.log(`✅ Cloud IP detected!`);
    console.log(result);
  } else {
    console.log(`❌ Not a cloud IP`);
  }

  // 3. Restrict by provider
  const awsCheck = await isIp('52.95.110.1', { provider: 'Amazon' });
  console.log(awsCheck);

  // 4. Get dataset summary
  console.log(getData());

  // 5. Force refresh
  await refresh();
})();
```

---

## ⚡ API

### `await load(options?: LoadOptions)`

Loads IP ranges from supported cloud providers into memory.
Uses an in-memory cache with configurable TTL.

**Options (`LoadOptions`):**

* `providers` *(string\[])* → list of providers to load (default: all)
* `ttlMs` *(number)* → cache TTL in milliseconds (default: 6h)
* `force` *(boolean)* → ignore cache freshness and force reload

**Returns:**

```js
{ loadedAt: number, count: number }
```

---

### `await isIp(ip: string, options?: IsIpOptions)`

Checks whether an IPv4 or IPv6 address belongs to a known cloud provider range.

**Parameters:**

* `ip` *(string)* → IP address to check
* `options` *(IsIpOptions)* (optional)

  * `provider` → restrict to a specific provider (e.g., "Amazon", "Microsoft")
  * `service` → restrict to a specific service (if available)
  * `regionId` → restrict to a specific region identifier (e.g., "eu-west-1")

**Returns (`IsIpResult`):**

```js
{
  match: boolean,
  reason?: 'invalid_ip' | 'provider_not_loaded',
  version?: 'ipv4' | 'ipv6',
  provider?: string,
  regionId?: string,
  region?: string|null,
  service?: string|null,
  cidr?: string
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

---

## 💡 Use cases

* 🔍 **Security logging**: enrich logs with provider info
* 🛡️ **Firewall / WAF rules**: detect and allow/deny traffic from clouds
* 📊 **Analytics**: categorize requests by hosting provider
* 🌍 **Geolocation**: improve IP intelligence with cloud-awareness

---

## 📝 License

MIT © Nicolò Vattai
