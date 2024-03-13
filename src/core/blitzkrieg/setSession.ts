import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { useSession } from '../../stores/session';
import { NormalizedTankStats, TanksStats } from '../../types/tanksStats';
import fetchBlitz from '../blitz/fetchBlitz';

export async function setSession(region: Region, id: number, nickname: string) {
  // TODO: generalize this function and also check for more of these kind
  const rawTankStats = (
    await fetchBlitz<TanksStats>(
      `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    )
  )[id];
  const tankStats = rawTankStats.reduce<NormalizedTankStats>(
    (accumulator, tank) => ({
      ...accumulator,
      [tank.tank_id]: tank,
    }),
    {},
  );

  useSession.setState({
    isTracking: true,
    id,
    region,
    nickname,
    tankStats,
    time: Date.now(),
  });
}
