'use client';

import { IndividualTankStats, Region, Stat } from '@blitzkit/core';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';

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
