import { LeagueTop, RatingPlayer, Region } from '@blitzkit/core';
import { regionToRegionSubdomain } from '../../../website/src/core/blitz/regionToRegionSubdomain';
import { context } from '../../../website/src/core/blitzkit/context';
import { patientFetch } from '../../../website/src/core/blitzkit/patientFetch';

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
