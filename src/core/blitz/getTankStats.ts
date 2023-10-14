import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import throwError from '../../LEGACY_core/node/throwError';
import { TanksStats } from '../../types/tanksStats';
import fetchBlitz from './fetchWargaming';

export default async function getTankStats(region: Region, id: number) {
  const tankStats = await fetchBlitz<TanksStats>(
    `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  if (tankStats[id] === null) {
    throw throwError(
      'No tank stats available',
      "This player doesn't have any stats for tanks available. This may not be the player you are looking for.",
    );
  }

  return tankStats[id];
}
