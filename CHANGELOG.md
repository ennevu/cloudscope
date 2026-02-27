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