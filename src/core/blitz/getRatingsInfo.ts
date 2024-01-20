import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

const ratingsInfoCache: Partial<Record<Region, RatingsInfo>> = {};

export default async function getRatingsInfo(region: Region) {
  if (ratingsInfoCache[region]) return ratingsInfoCache[region]!;

  const response = await patientFetch(
    context === 'website'
      ? `/api/${region}/ratings/current/info`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/season/`,
    undefined,
    { cache: 'no-store' },
  );
  const data = (await response.json()) as RatingsInfo;

  ratingsInfoCache[region] = data;

  return data;
}
