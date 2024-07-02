import { produce } from 'immer';
import { create } from 'zustand';

export const tankPerformanceSortTypeNames = {
  winrate: 'Winrate',
  players: 'Players (30d)',
  battles: 'Battles (career)',
  damage: 'Damage',
  survival: 'Survival',
  xp: 'XP',
  kills: 'Kills',
  spots: 'Spots',
  accuracy: 'Accuracy',
  shots: 'Shots',
  hits: 'Hits',
  damageRatio: 'Dmg. ratio',
  damageTaken: 'Dmg. taken',
  capturePoints: 'Cap points',
} as const;

export const tankPerformanceSortTypeNamesArray = Object.keys(
  tankPerformanceSortTypeNames,
) as TankPerformanceSortType[];

type TankPerformanceSortType = keyof typeof tankPerformanceSortTypeNames;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const useTankPerformanceSort = create<TankPerformanceSort>()(() => ({
  type: 'battles',
  direction: -1,
}));

export function mutateTankPerformanceSort(
  recipe: (draft: TankPerformanceSort) => void,
) {
  useTankPerformanceSort.setState(produce(recipe));
}
