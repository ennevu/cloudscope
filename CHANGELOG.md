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