import { Region, RegionSubdomain } from '../../constants/regions';

export default function regionToRegionSubdomain(
  regionDomain: Region,
): RegionSubdomain {
  return regionDomain === 'com' ? 'na' : regionDomain;
}
