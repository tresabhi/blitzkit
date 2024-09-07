import { Region, RegionSubdomain } from '../../constants/regions';

export default function regionSubdomainToRegion(
  regionDomain: RegionSubdomain,
): Region {
  return regionDomain === 'na' ? 'com' : regionDomain;
}
