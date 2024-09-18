import type { TankClass, Tier, TreeType } from '@blitzkit/core';
import { map } from 'nanostores';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TreeType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const $tankFilters = map<TankFilters>({
  tiers: [],
  nations: [],
  classes: [],
  types: [],
  testing: 'include',
  search: undefined,
  searching: false,
});
