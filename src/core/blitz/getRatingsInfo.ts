import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export default async function getRatingsInfo(region: Region) {
  const response = await fetch(
    `https://${regionToRegionSubdomain(
      region,
    )}.wotblitz.com/en/api/rating-leaderboards/season/`,
  );

  return (await response.json()) as Promise<RatingsInfo>;
}
