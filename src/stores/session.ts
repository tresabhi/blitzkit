import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Region } from '../constants/regions';
import { NormalizedTankStats } from '../types/tanksStats';

type Session =
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
    };

export const useSession = create<Session>()(
  devtools(persist((set) => ({ isTracking: false }), { name: 'session' })),
);
