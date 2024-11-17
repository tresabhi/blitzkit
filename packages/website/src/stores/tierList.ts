import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tierListRows } from '../components/TierList/Table/constants';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface TierList {
  dragging: boolean;
  tanks: number[][];
}

export const TierList = createContextualStore(() =>
  create<TierList>()(
    subscribeWithSelector<TierList>(() => ({
      dragging: false,
      tanks: tierListRows.map(() => []),
    })),
  ),
);
