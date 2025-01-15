import type en from '@blitzkit/i18n/strings/en.json';
import { create } from 'zustand';
import { createContextualStore } from '../../core/zustand/createContextualStore';

export type TankPerformanceSortType =
  keyof typeof en.website.tools.performance.table.stats;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const TankPerformanceSort = createContextualStore(() =>
  create<TankPerformanceSort>()(() => ({
    type: 'winrate',
    direction: -1,
  })),
);
