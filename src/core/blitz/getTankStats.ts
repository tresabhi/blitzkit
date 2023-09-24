import { REGION_NAMES, Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { TanksStats } from '../../types/tanksStats';
import throwError from '../node/throwError';
import getWargamingResponse from './getWargamingResponse';

export default async function getTankStats(region: Region, id: number) {
  const tankStats = await getWargamingResponse<TanksStats>(
    `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  if (tankStats[id] === null) {
    throw throwError(
      'No tank stats available',
      `Wargaming says there is no tank stats for this account. This account may not have any battles/tanks or exist in the ${REGION_NAMES[region]} server.`,
    );
  }

  return tankStats[id];
}
