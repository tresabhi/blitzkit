import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomColumnDisplay } from '../app/tools/session/components/CustomColumn';
import { AccentColor, GrayColor } from '../constants/radixColors';
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
    { name: 'session', merge: (a, b) => merge(b, a) },
  ),
);

export default function mutateSession(recipe: (draft: Session) => void) {
  useSession.setState(produce(recipe));
}
