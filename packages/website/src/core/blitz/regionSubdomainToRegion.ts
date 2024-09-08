import { Region, RegionSubdomain } from "@blitzkit/core";

export default function regionSubdomainToRegion(
  regionDomain: RegionSubdomain,
): Region {
  return regionDomain === 'na'   ? 'com'  : regionDomain;
}
