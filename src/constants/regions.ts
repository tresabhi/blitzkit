export type Region = 'com' | 'eu' | 'asia';
export type RegionSubdomain = 'na' | 'eu' | 'asia';

export const REGION_NAMES: Record<Region, string> = {
  com: 'North America',
  eu: 'Europe',
  asia: 'Asia',
};

// https://planetarynames.wr.usgs.gov/Abbreviations
export const REGION_NAMES_SHORT: Record<Region, string> = {
  com: 'NA',
  eu: 'EU',
  asia: 'ASIA',
};

export const REGION_SUBDOMAIN_NAMES: Record<RegionSubdomain, string> = {
  na: 'North America',
  eu: 'Europe',
  asia: 'Asia',
};
