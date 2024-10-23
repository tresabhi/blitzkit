import { Region, RegionSubdomain } from '@blitzkit/core';

export function regionSubdomainToRegion(regionDomain: RegionSubdomain): Region {
  return regionDomain === 'na' ? 'com' : regionDomain;
}
