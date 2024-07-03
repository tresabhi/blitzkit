import { produce } from 'immer';
import { create } from 'zustand';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';

export interface TankopediaFilters {
  tier?: Tier;
  nation?: string;
  class?: TankClass;
  type?: TreeType;
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const useTankopediaFilters = create<TankopediaFilters>()(() => ({
  testing: 'include',
  searching: false,
}));

export function mutateTankopediaFilters(
  recipe: (draft: TankopediaFilters) => void,
) {
  useTankopediaFilters.setState(produce(recipe));
}
