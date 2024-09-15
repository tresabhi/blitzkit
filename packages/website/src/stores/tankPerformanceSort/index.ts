import { create } from 'zustand';
import { createContextualSafeStore } from '../../core/zustand/createContextualSafeStore';
import { TankPerformanceSortTypeNames } from './constants';

export type TankPerformanceSortType = keyof typeof TankPerformanceSortTypeNames;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const { Provider, use, useMutation, useStore } =
  createContextualSafeStore(() =>
    create<TankPerformanceSort>()(() => ({
      type: 'winrate',
      direction: -1,
    })),
  );
