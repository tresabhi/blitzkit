import { RatingsNeighbors } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { context } from '../blitzkrieg/context';
import { patientFetch } from '../blitzkrieg/patientFetch';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingsNeighbors(
  region: Region,
  id: number,
  count: number,
  usePatientFetcher = false,
) {
  const fetcher = usePatientFetcher ? patientFetch : fetch;
  const response = await fetcher(
    context === 'website'
      ? `/api/${region}/ratings/current/neighbors/${id}/${count}`
      : `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${count}`,
  );
  const json = (await response.json()) as RatingsNeighbors;

  return json;
}
