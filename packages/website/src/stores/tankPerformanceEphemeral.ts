import type { Samples } from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface TankPerformanceEphemeral {
  playerCountPeriod: PlayerCountPeriod;
  mode: TankPerformanceMode;
}

export enum TankPerformanceMode {
  Table,
  Charts,
}

export type PlayerCountPeriod = keyof Samples;

export const TankPerformanceEphemeral = createContextualStore(() =>
  create<TankPerformanceEphemeral>()(() => ({
    playerCountPeriod: 'd_30',
    mode: TankPerformanceMode.Charts,
  })),
);
