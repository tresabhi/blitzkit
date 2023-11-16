import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export default async function getRatingsInfo(region: Region) {
  const response = await patientFetch(
    context === 'website'
      ? `/api/${region}/ratings/current/info`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/season/`,
    undefined,
    { cache: 'no-store' },
  );

  return (await response.json()) as Promise<RatingsInfo>;
}
