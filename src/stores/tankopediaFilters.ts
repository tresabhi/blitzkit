import { produce } from 'immer';
import { create } from 'zustand';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';
import { TankopediaSortBy, TankopediaSortDirection } from './tankopedia';

export interface TankopediaFilters {
  tier?: Tier;
  nation?: string;
  class?: TankClass;
  type?: TreeType;
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
  searching: boolean;
}

export const useTankopediaFilters = create<TankopediaFilters>()(() => ({
  testing: 'include',
  sort: {
    by: 'meta.none',
    direction: 'descending',
  },
  tier: 10,
  searching: false,
}));

export function mutateTankopediaFilters(
  recipe: (draft: TankopediaFilters) => void,
) {
  useTankopediaFilters.setState(produce(recipe));
}
