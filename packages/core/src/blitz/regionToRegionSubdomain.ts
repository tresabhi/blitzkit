import { Region, RegionSubdomain } from '@blitzkit/core';

export function regionToRegionSubdomain(regionDomain: Region): RegionSubdomain {
  return regionDomain === 'com' ? 'na' : regionDomain;
}
