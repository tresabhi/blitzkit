import { RatingInfo } from '../../commands/ratingLeaderboard';
import { Region } from '../../constants/regions';
import { context } from '../blitzrinth/context';
import { patientFetch } from '../blitzrinth/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

const cache: Partial<Record<Region, RatingInfo>> = {};

export default async function getRatingInfo(region: Region) {
  if (cache[region]) return cache[region]!;

  const response = await patientFetch(
    context === 'website'
      ? `/api/${region}/rating/current/info`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/season/`,
    undefined,
    { cache: 'no-store' },
  );
  const data = (await response.json()) as RatingInfo;

  cache[region] = data;

  return data;
}
