import { REGION_NAMES, Region } from '../../constants/regions';
import { TankStats } from '../../types/tanksStats';
import { secrets } from '../node/secrets';
import throwError from '../node/throwError';
import getWargamingResponse from './getWargamingResponse';

export default async function getTankStats(region: Region, id: number) {
  const tankStats = await getWargamingResponse<TankStats>(
    `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  if (tankStats[id] === null) {
    throw throwError(
      'No tank stats available',
      `Wargaming says there is no tank stats for this account. This account may not have any battles/tanks or exist in the ${REGION_NAMES[region]} server.`,
    );
  }

  return tankStats[id];
}
