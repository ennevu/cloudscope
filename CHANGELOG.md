## [0.3.0] - 2026-05-15

### Added

- Added SaaS/company IP identification alongside cloud provider detection. A single IP can now be attributed to both the underlying infrastructure provider and the company or SaaS service using that range.
- Added SaaS/company source loading through the new `companies` option in `load()`.
- Added initial SaaS/company datasets for DataDog, GitHub, Terraform, CircleCI, Zendesk, Okta, and Grafana.
- Added `type` metadata to normalized records and matches. Supported categories currently include `cloud`, `cdn`, and `saas`.
- Added support for returning multiple matches for the same IP address.
- Added tests for overlapping cloud/SaaS matches and service filtering.

### Changed

- CIDR matching now uses parsed `ipaddr.js` ranges internally for both IPv4 and IPv6, reducing per-check work and making IP lookups faster.
- Provider loaders now normalize records with a consistent `provider` field and include `type` metadata.

### Breaking Changes

- Successful `isIp()` results now return `{ match: true, matches: [...] }`. Match details such as `provider`, `country`, `regionId`, `service`, and `cidr` moved from top-level fields into each entry of `matches`.
- `service` is now `string[] | null` instead of `string | null`, because some ranges can expose multiple services. For example, an AWS range can include `EC2`, `AMAZON`, and `CHIME_VOICECONNECTOR`.

## [0.2.4] - 2026-05-01
### Fixed
 - Changed to static mapping for Aliyun (previously was dynamic and broke due to provider site update)
 
## [0.2.3] - 2026-04-30
### Fixed
 - Fixed Aliyun incorrect parsing bug due to provider site update
 - Fixed pumpCloud incorrect parsing bug (city was removed)
 - Removed Eons Cloud references and Interetone (not reachable anymore)
 - Added country mapping for Oracle Cloud (previously was null)
 - Fixed missing mapping regions for AWS : us-gov-west-1, us-gov-east-1, me-west-1, sa-west-1 and us-south-1 and Aliyun: na-south-1

### Added
 - Added support for Hostinger, 62Yun, Fastly, DedCloud, Cherry Servers, RapidSeedbox, Dynanode

## [0.2.1] - 2026-02-20

### Fixed
 - Fixed parsing in MyCloud where geofeed data was not commented
 - Bug in AWS where IPv6 first entries where added with region null
 - Removed Eons Cloud (geofeed not reachable anymore)
 - Patched Aruba Cloud (geofeed mismatch between city and country)

### Added
 - Filtering by ISO3166 country codes is now possible
 - Auto testing workflows

## [0.2.0] - 2026-02-20

### Added
- Introduced a new export function to generate and download the normalized dataset.
- Added support for multiple cloud providers and hosting services, including Aliyun (Alibaba Cloud), Hetzner, Kaopu Cloud, Aruba, and others.
- Manual map of region names for major cloud providers 

### Changed
- Removed internal loading logic from the `IsIp` function to prevent unnecessary `await` usage and improve performance in high-scale scenarios.
- Removed axios dependency and switched to nodes fetch
