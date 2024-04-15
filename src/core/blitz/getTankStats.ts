import { Region } from '../../constants/regions';
import { TanksStats } from '../../types/tanksStats';
import fetchBlitz from './fetchBlitz';

export default async function getTankStats(region: Region, id: number) {
  const tankStats = await fetchBlitz<TanksStats>(region, 'tanks/stats', {
    account_id: id,
  });

  return tankStats[id];
}
