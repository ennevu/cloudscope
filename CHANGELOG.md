## [0.2.0] - 2026-02-20

### Added
- Introduced a new export function to generate and download the normalized dataset.
- Added support for multiple cloud providers and hosting services, including Aliyun (Alibaba Cloud), Hetzner, Kaopu Cloud, Aruba, and others.
- Manual map of region names for major cloud providers 

### Changed
- Removed internal loading logic from the `IsIp` function to prevent unnecessary `await` usage and improve performance in high-scale scenarios.
- Removed axios dependency and switched to nodes fetch