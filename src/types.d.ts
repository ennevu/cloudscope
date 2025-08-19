// types.d.ts

/**
 * A normalized record of cloud provider CIDR ranges.
 */
export interface NormalizedRecord {
  /** Cloud provider name */
  provider:
    | 'Amazon'
    | 'Microsoft'
    | 'Google'
    | 'Oracle'
    | 'IBM'
    | 'Digital Ocean'
    | 'Linode'
    | 'Exoscale'
    | 'Vultr';

  /** Cloud region identifier (e.g., "eu-west-1", "global") */
  regionId: string;

  /** Human-readable region name, when available */
  region: string | null;

  /** Specific service name (e.g., "S3", "Compute"), when available */
  service: string | null;

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
  providers?: Array<
    | 'azure'
    | 'aws'
    | 'gcp'
    | 'ibm'
    | 'oracle'
    | 'digitalocean'
    | 'linode'
    | 'exoscale'
    | 'vultr'
  >;

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
  provider?: NormalizedRecord['provider'];

  /** Restrict to a specific service */
  service?: string;

  /** Restrict to a specific region identifier */
  regionId?: string;
}

/**
 * Result returned by `isIp`.
 */
export interface IsIpResult {
  /** Whether the IP matched */
  match: boolean;

  /** Reason if not matched */
  reason?: 'invalid_ip' | 'provider_not_loaded';

  /** IP version of the match */
  version?: 'ipv4' | 'ipv6';

  /** Provider that matched */
  provider?: NormalizedRecord['provider'];

  /** Region identifier */
  regionId?: string;

  /** Region name */
  region?: string | null;

  /** Service name */
  service?: string | null;

  /** CIDR block that matched */
  cidr?: string;
}

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

export function isIp(ip: string, options?: IsIpOptions): Promise<IsIpResult>;

export function getData(): DataSummary;

export function refresh(): Promise<{ loadedAt: number; count: number }>;
