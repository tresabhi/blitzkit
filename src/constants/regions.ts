export const REGIONS = ['com', 'eu', 'asia'] as const;

export type Region = (typeof REGIONS)[number];
export type RegionSubdomain = 'na' | 'eu' | 'asia';

/**
 * @deprecated
 */
export const UNLOCALIZED_REGION_NAMES: Record<Region, string> = {
  com: 'North America',
  asia: 'Asia',
  eu: 'Europe',
};

/**
 * @deprecated
 */
export const UNLOCALIZED_REGION_NAMES_SHORT: Record<Region, string> = {
  com: 'NA',
  asia: 'APAC',
  eu: 'EU',
};
