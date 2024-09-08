import { Region, RegionSubdomain } from "@blitzkit/core";

export default function regionToRegionSubdomain(
  regionDomain: Region,
): RegionSubdomain {
  return regionDomain === 'com' ? 'na' : regionDomain;
}
