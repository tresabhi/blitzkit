import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Region } from '../constants/regions';
import { Stat } from '../core/blitz/generateStats';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';
import { IndividualTankStats } from '../types/tanksStats';

interface SessionBase {
  columns: Stat[];
}

export interface SessionTracking extends SessionBase {
  tracking: true;
  player: {
    id: number;
    region: Region;
    since: number;
    stats: IndividualTankStats[];
  };
}

interface SessionNotTracking extends SessionBase {
  tracking: false;
}

type Session = SessionTracking | SessionNotTracking;

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<Session>()(
      persist(
        (set) => ({
          columns: ['battles', 'winrate', 'wn8', 'averageDamage'],
          tracking: false,
        }),
        { name: 'session-2', merge: (a, b) => merge(b, a) },
      ),
    ),
);
