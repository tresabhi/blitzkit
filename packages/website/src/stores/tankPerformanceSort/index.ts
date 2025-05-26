import type { BlitzKitStrings } from 'packages/i18n/src';
import { create } from 'zustand';
import { createContextualStore } from '../../core/zustand/createContextualStore';

export type TankPerformanceSortType =
  keyof BlitzKitStrings['website']['tools']['performance']['table']['stats'];

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
