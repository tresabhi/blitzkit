import type {
  CompositeStatsKey,
  IndividualTankStats,
  Region,
} from '@blitzkit/core';
import { merge } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

interface SessionBase {
  columns: CompositeStatsKey[];
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

export const Session = createContextualStore(() =>
  create<Session>()(
    persist(
      (_) => ({
        columns: [
          'cumulative_battles',
          'normalized_wins',
          'cumulative_wn8',
          'normalized_damage_dealt',
        ],
        tracking: false,
      }),
      { name: 'session-3', merge: (a, b) => merge(b, a) },
    ),
  ),
);
