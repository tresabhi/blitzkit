import { RatingInfo, Region } from '@blitzkit/core';
import { regionToRegionSubdomain } from '../../../website/src/core/blitz/regionToRegionSubdomain';
import { context } from '../../../website/src/core/blitzkit/context';
import { patientFetch } from '../../../website/src/core/blitzkit/patientFetch';

const cache: Partial<Record<Region, RatingInfo>> = {};

export async function getRatingInfo(region: Region) {
  if (cache[region]) return cache[region]!;

  const response = await patientFetch(
    context === 'website'
      ? `/api/${region}/rating/current/info`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/season/`,
    undefined,
  );
  const data = (await response.json()) as RatingInfo;

  cache[region] = data;

  return data;
}
