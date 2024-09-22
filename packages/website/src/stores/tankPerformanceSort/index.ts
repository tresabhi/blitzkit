import { create } from 'zustand';
import { createContextualStore } from '../../core/zustand/createContextualStore';
import { TankPerformanceSortTypeNames } from './constants';

export type TankPerformanceSortType = keyof typeof TankPerformanceSortTypeNames;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const { Provider, use, useMutation, useStore } = createContextualStore(
  () =>
    create<TankPerformanceSort>()(() => ({
      type: 'winrate',
      direction: -1,
    })),
);
