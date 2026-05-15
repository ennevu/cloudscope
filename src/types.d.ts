import type ipaddr = require('ipaddr.js');

export type ProviderId =
  | 'azure'
  | 'aws'
  | 'gcp'
  | 'ibm'
  | 'oracle'
  | 'digitalocean'
  | 'linode'
  | 'exoscale'
  | 'vultr'
  | 'nifcloud'
  | 'scaleway'
  | 'cloudflare'
  | 'aliyun'
  | 'aruba'
  | 'elastx'
  | 'hetzner'
  | 'eurohoster'
  | 'hostealo'
  | 'zappiehost'
  | 'hosthatch'
  | 'pumpcloud'
  | 'kaopucloud'
  | 'cloudcomtr'
  | 'crowncloud'
  | 'mikicloud'
  | 'gthost'
  | 'lowhosting'
  | 'mathost'
  | 'mchost'
  | 'mclouds'
  | 'halocloud'
  | 'rarecloud'
  | 'jinxcloud'
  | 'xtom'
  | 'akile'
  | 'vecloud'
  | 'hostbilby'
  | 'hostglobal'
  | 'kamatera'
  | 'gcore'
  | 'contabo'
  | 'timeweb'
  | 'seasoncloud'
  | 'datalix'
  | 'c1vhosting'
  | '3hcloud'
  | 'cloudzy'
  | 'cloud225'
  | 'cloudnet'
  | 'sejacloud'
  | 'letscloud'
  | 'maikiwi'
  | 'serverside'
  | 'mycloud'
  | 'mymisaka'
  | 'railway'
  | 'csti'
  | 'seeweb'
  | 'axera'
  | 'hostinger'
  | '62yun'
  | 'dedcloud'
  | 'fastly'
  | 'rapidseedbox'
  | 'dynanode'
  | 'cherryservers';

export type CompanyId = 'datadog' | 'github' | 'terraform' | 'circleci' | 'zendesk' | 'okta' | 'grafana';

export type ProviderName =
  | 'Amazon'
  | 'Microsoft'
  | 'Google'
  | 'Oracle'
  | 'IBM'
  | 'Digital Ocean'
  | 'Linode'
  | 'Exoscale'
  | 'Vultr'
  | 'NIFCloud'
  | 'Scaleway'
  | 'Cloudflare'
  | 'Aliyun'
  | 'Aruba Cloud'
  | 'Elastx'
  | 'Hetzner'
  | 'EuroHoster'
  | 'Hostealo'
  | 'ZappieHost'
  | 'HostHatch'
  | 'PumpCloud'
  | 'Kaopu Cloud'
  | 'Cloud.com.tr'
  | 'CrownCloud'
  | 'Miku Cloud'
  | 'GT Host'
  | 'Low Hosting'
  | 'MatHost'
  | 'McHost'
  | 'MClouds.ru'
  | 'Halo Cloud'
  | 'Rare Cloud'
  | 'Jinx Cloud'
  | 'xTom'
  | 'Akile Cloud'
  | 'VeCloud'
  | 'HostBilby'
  | 'HostGlobal'
  | 'Kamatera'
  | 'GCore'
  | 'Contabo'
  | 'TimeWeb'
  | 'Season Cloud'
  | 'DataLix'
  | 'C1V Hosting'
  | '3H Cloud'
  | 'Cloudzy'
  | 'Cloud225'
  | 'CloudNet'
  | 'Seja Cloud'
  | 'Lets Cloud'
  | 'Maikiwi'
  | 'Serverside'
  | 'MyCloud'
  | 'MyMisaka'
  | 'Railway'
  | 'CSTI'
  | 'SeeWeb'
  | 'Axera'
  | 'Hostinger'
  | '62Yun'
  | 'DedCloud'
  | 'Fastly'
  | 'RapidSeedbox'
  | 'DynaNode'
  | 'Cherry Servers'
  | 'DataDog'
  | 'GitHub'
  | 'Terraform'
  | 'CircleCI'
  | 'Zendesk'
  | 'Okta'
  | 'Grafana';

export type RecordType = 'cloud' | 'cdn' | 'saas' | string;

export type IPv4Cidr = [ipaddr.IPv4, number];
export type IPv6Cidr = [ipaddr.IPv6, number];

/**
 * A normalized record of provider CIDR ranges.
 */
export interface NormalizedRecord {
  /** Provider or company name */
  provider: ProviderName | string;

  /** Provider category */
  type: RecordType[];

  /** Country code (ISO 3166-1 alpha-2), when available */
  country?: string | null;

  /** Region identifier (e.g. "eu-west-1", "global"), when available */
  regionId?: string | null;

  /** Human-readable region name, when available */
  region?: string | null;

  /** Specific service names, when available */
  service: string[] | null;

  /** List of parsed IPv4 CIDR ranges */
  addressesv4: IPv4Cidr[];

  /** List of parsed IPv6 CIDR ranges */
  addressesv6: IPv6Cidr[];
}

export interface ExportedRecord extends Omit<NormalizedRecord, 'addressesv4' | 'addressesv6'> {
  /** List of IPv4 CIDR ranges */
  addressesv4: string[];

  /** List of IPv6 CIDR ranges */
  addressesv6: string[];
}

/**
 * Options for the `load` function.
 */
export interface LoadOptions {
  /** Providers to load. Defaults to all. */
  providers?: ProviderId[];

  /** Companies/SaaS providers to load. Defaults to all. */
  companies?: CompanyId[];

  /** Cache TTL in milliseconds (default: 6h) */
  ttlMs?: number;

  /** Force reload, ignoring cache */
  force?: boolean;
}

/**
 * Options for the `isIp` function.
 */
export interface IsIpOptions {
  /** Restrict to a specific provider */
  provider?: ProviderName | string;

  /** Restrict to a specific service */
  service?: string;

  /** Restrict to a specific region identifier */
  regionId?: string;

  /** Restrict to a specific country code (ISO 3166-1 alpha-2) */
  country?: string | string[];
}

export interface IpMatch extends Omit<NormalizedRecord, 'addressesv4' | 'addressesv6'> {
  /** IP version of the match */
  version: 'ipv4' | 'ipv6';

  /** CIDR block that matched */
  cidr: string;
}

export type IsIpResult =
  | {
      match: true;
      matches: IpMatch[];
    }
  | {
      match: false;
      reason?: 'invalid_ip' | 'provider_not_loaded' | 'data_not_loaded';
    };

/**
 * Lightweight summary of the dataset.
 */
export interface DataSummary {
  /** When data was last loaded (epoch ms) */
  loadedAt: number | null;

  /** Cache TTL in milliseconds */
  ttlMs: number;

  /** Number of normalized records */
  count: number;

  /** List of available providers */
  providers: string[];
}

/**
 * Public API
 */
export function load(opts?: LoadOptions): Promise<{ loadedAt: number; count: number }>;

export function isIp(ip: string, options?: IsIpOptions): IsIpResult;

export function getData(): DataSummary;

export function refresh(): Promise<{ loadedAt: number; count: number }>;

export function exportData(): ExportedRecord[];
