import { produce } from 'immer';
import { create } from 'zustand';
import { TankopediaSortBy, TankopediaSortDirection } from './tankopedia';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const useTankopediaSort = create<TankopediaSort>()(() => ({
  by: 'meta.none',
  direction: 'descending',
}));

export function mutateTankopediaSort(recipe: (draft: TankopediaSort) => void) {
  useTankopediaSort.setState(produce(recipe));
}
