import { LeagueTop, RatingsPlayer } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingsLeague(
  region: Region,
  league: number,
  usePatientFetcher = false,
) {
  const fetcher = (url: string) =>
    usePatientFetcher
      ? patientFetch(url, undefined, { cache: 'no-store' })
      : fetch(url, { cache: 'no-store' });
  const response = await fetcher(
    context === 'website'
      ? `/api/${region}/ratings/current/league/${league}`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/league/${league}/top/`,
  );
  const json = await response.json();

  return context === 'website'
    ? (json as RatingsPlayer[])
    : (json as LeagueTop).result;
}
