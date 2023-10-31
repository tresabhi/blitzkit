import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { withCORSProxy } from '../blitzkrieg/withCORSProxy';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export default async function getRatingsInfo(region: Region) {
  const response = await fetch(
    withCORSProxy(
      context === 'bot'
        ? `https://${regionToRegionSubdomain(
            region,
          )}.wotblitz.com/en/api/rating-leaderboards/season/`
        : `/api/ratings/info/${region}`,
    ),
  );

  return (await response.json()) as Promise<RatingsInfo>;
}
