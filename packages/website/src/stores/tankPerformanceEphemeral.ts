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

export enum PlayerCountPeriod {
  Past120Days = 'd_120',
  Past90Days = 'd_90',
  Past60Days = 'd_60',
  ThisMonth = 'd_30',
  ThisWeek = 'd_7',
  Yesterday = 'd_1',
}

export const TankPerformanceEphemeral = createContextualStore(() =>
  create<TankPerformanceEphemeral>()(() => ({
    playerCountPeriod: PlayerCountPeriod.ThisMonth,
    mode: TankPerformanceMode.Table,
  })),
);
