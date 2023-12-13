import { produce } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomColumnDisplay } from '../app/tools/session/components/CustomColumn';
import { AccentColor, GrayColor } from '../constants/radixColors';
import { Region } from '../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import fetchBlitz from '../core/blitz/fetchBlitz';
import { NormalizedTankStats, TanksStats } from '../types/tanksStats';

type Session = (
  | {
      isTracking: false;
    }
  | {
      isTracking: true;

      region: Region;
      id: number;
      nickname: string;
      tankStats: NormalizedTankStats;
      time: number;
    }
) & {
  title: string;
  resetPrompt: boolean;
  embedPrompt: boolean;
  customColumns: {
    display: CustomColumnDisplay;
    showDelta: boolean;
  }[] & { length: 4 };
  showTotal: boolean;
  showCareer: boolean;
  color: AccentColor | GrayColor;
};

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

export function resetSession() {
  const session = useSession.getState();
  if (!session.isTracking) return;
  setSession(session.region, session.id, session.nickname);
}

export const useSession = create<Session>()(
  persist(
    (set) => ({
      title: 'Untitled session',
      isTracking: false,
      resetPrompt: true,
      showTotal: true,
      showCareer: true,
      embedPrompt: true,

      customColumns: [
        { display: 'battles', showDelta: false },
        { display: 'winrate', showDelta: true },
        { display: 'wn8', showDelta: false },
        { display: 'damage', showDelta: true },
      ],
      color: 'slate',
    }),
    { name: 'session' },
  ),
);

export default function mutateSession(recipe: (draft: Session) => void) {
  useSession.setState(produce(recipe));
}
