import { RatingNeighbors, Region } from '@blitzkit/core';
import { patientFetch } from '../../../website/src/core/blitzkit/patientFetch';
import { withCORSProxy } from '../../../website/src/core/blitzkit/withCORSProxy';
import { regionToRegionSubdomain } from './regionToRegionSubdomain';

export async function getRatingNeighbors(
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
  const json = (await response.json()) as RatingNeighbors;

  return json;
}
