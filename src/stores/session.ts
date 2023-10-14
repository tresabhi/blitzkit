import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CustomColumnDisplay } from '../app/tools/session/components/CustomColumn';
import { Region } from '../constants/regions';
import { NormalizedTankStats } from '../types/tanksStats';

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
  promptBeforeReset: boolean;
  showEmbedPrompt: boolean;
  customColumns: {
    display: CustomColumnDisplay;
    showDelta: boolean;
  }[] & { length: 4 };
  showTotal: boolean;
  showCareer: boolean;
};

export const useSession = create<Session>()(
  devtools(
    persist(
      (set) => ({
        isTracking: false,
        promptBeforeReset: true,
        showTotal: true,
        showCareer: true,
        showEmbedPrompt: true,

        customColumns: [
          { display: 'battles', showDelta: false },
          { display: 'winrate', showDelta: true },
          { display: 'wn8', showDelta: false },
          { display: 'damage', showDelta: true },
        ],
      }),
      {
        name: 'session',
      },
    ),
  ),
);

export default function mutateSession(recipe: (draft: Session) => void) {
  useSession.setState(produce(recipe));
}
