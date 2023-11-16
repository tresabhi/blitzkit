import { RatingsNeighbors } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { patientFetch } from '../blitzkrieg/patientFetch';
import { withCORSProxy } from '../blitzkrieg/withCORSProxy';
import regionToRegionSubdomain from './regionToRegionSubdomain';

export async function getRatingsNeighbors(
  region: Region,
  id: number,
  count: number,
  usePatientFetcher = false,
) {
  const fetcher = (url: string) =>
    usePatientFetcher
      ? patientFetch(url, undefined, { cache: 'no-store' })
      : fetch(url, { cache: 'no-store' });
  const response = await fetcher(
    withCORSProxy(
      `https://${regionToRegionSubdomain(
        region,
      )}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${count}`,
    ),
  );
  const json = (await response.json()) as RatingsNeighbors;

  return json;
}
