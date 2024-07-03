import { produce } from 'immer';
import { create } from 'zustand';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TreeType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const useTankFilters = create<TankFilters>()(() => ({
  testing: 'include',
  searching: false,
  classes: [],
  nations: [],
  tiers: [],
  types: [],
}));

export function mutateTankFilters(recipe: (draft: TankFilters) => void) {
  useTankFilters.setState(produce(recipe));
}
