import type { TankClass, TankType, Tier } from '@blitzkit/core';
import { map } from 'nanostores';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TankType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const initialTankFilters: TankFilters = {
  tiers: [],
  nations: [],
  classes: [],
  types: [],
  testing: 'include',
  search: undefined,
  searching: false,
};

export const $tankFilters = map<TankFilters>(initialTankFilters);
