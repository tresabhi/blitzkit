import { LeagueTop, RatingPlayer } from '../../commands/ratingLeaderboard';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingLeague(
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
      ? `/api/${region}/rating/current/league/${league}`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/league/${league}/top/`,
  );
  const json = await response.json();

  return context === 'website'
    ? (json as RatingPlayer[])
    : (json as LeagueTop).result;
}
