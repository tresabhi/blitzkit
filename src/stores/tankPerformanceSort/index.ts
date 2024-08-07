'use client';

import { create } from 'zustand';
import { createNextSafeStore } from '../../core/zustand/createNextSafeStore';
import { TankPerformanceSortTypeNames } from './constants';

export type TankPerformanceSortType = keyof typeof TankPerformanceSortTypeNames;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<TankPerformanceSort>()(() => ({
      type: 'winrate',
      direction: -1,
    })),
);
