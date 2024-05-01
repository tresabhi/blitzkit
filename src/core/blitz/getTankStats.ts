import { Region } from '../../constants/regions';
import { TanksStats } from '../../types/tanksStats';
import fetchBlitz, { FetchBlitzParams } from './fetchBlitz';

export default async function getTankStats(
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
