import { IndividualTankStats, Region, Stat } from '@blitzkit/core';
import lodash from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

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

export const { Provider, use, useMutation, useStore } = createContextualStore(
  () =>
    create<Session>()(
      persist(
        (set) => ({
          columns: ['battles', 'winrate', 'wn8', 'averageDamage'],
          tracking: false,
        }),
        { name: 'session-2', merge: (a, b) => lodash.merge(b, a) },
      ),
    ),
);
