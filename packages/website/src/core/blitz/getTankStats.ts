import { Region, TanksStats } from '@blitzkit/core';
import {
  fetchBlitz,
  FetchBlitzParams,
} from '@blitzkit/core/src/blitz/fetchBlitz';

export async function getTankStats(
  region: Region,
  id: number,
  params?: FetchBlitzParams,
) {
  const tankStats = await fetchBlitz<TanksStats>(region, 'tanks/stats', {
    account_id: id,
    ...params,
  });

  return tankStats[id];
}
