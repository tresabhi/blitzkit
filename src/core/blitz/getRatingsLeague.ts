import { LeagueTop } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingsLeague(
  region: Region,
  league: number,
  usePatientFetcher = false,
) {
  const fetcher = usePatientFetcher ? patientFetch : fetch;
  const response = await fetcher(
    context === 'website'
      ? `/api/${region}/ratings/current/league/${league}`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/league/${league}/top/`,
  );
  const json = (await response.json()) as LeagueTop;

  return json;
}
