export type RegionDomain = 'com' | 'eu' | 'asia';
export type RegionSubdomain = 'na' | 'eu' | 'asia';

export const REGION_DOMAIN_NAMES: Record<RegionDomain, string> = {
  com: 'North America',
  eu: 'Europe',
  asia: 'Asia',
};

export const REGION_SUBDOMAIN_NAMES: Record<RegionSubdomain, string> = {
  na: 'North America',
  eu: 'Europe',
  asia: 'Asia',
};
