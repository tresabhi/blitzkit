import { LeagueTop } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { patientFetch } from '../blitzkrieg/patientFetch';
import { withCORSProxy } from '../blitzkrieg/withCORSProxy';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingsLeague(
  region: Region,
  league: number,
  usePatientFetcher = false,
) {
  const fetcher = usePatientFetcher ? patientFetch : fetch;
  const response = await fetcher(
    withCORSProxy(
      `https://${regionToRegionSubdomain(
        region,
      )}.wotblitz.com/en/api/rating-leaderboards/league/${league}/top/`,
    ),
  );
  const json = (await response.json()) as LeagueTop;

  return json;
}
