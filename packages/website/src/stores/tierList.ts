import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tierListRows } from '../components/TierList/Table/constants';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface TierList {
  dragging: boolean;
  rows: { name: string; tanks: number[] }[];
  placedTanks: Set<number>;
}

enableMapSet();

export const tierListInitialState: TierList = {
  dragging: false,
  rows: tierListRows.map((row) => ({
    name: row.name,
    tanks: [],
  })),
  placedTanks: new Set(),
};

export const TierList = createContextualStore(() =>
  create<TierList>()(
    subscribeWithSelector<TierList>(() => tierListInitialState),
  ),
);
