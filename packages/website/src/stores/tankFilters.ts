import type { GunDefinition, TankClass, TankType } from '@blitzkit/core';
import { map } from 'nanostores';

export type CaseType<T> = T extends {
  gun_type?: { $case: infer U; value: any };
}
  ? U
  : never;

export interface TankFilters {
  tiers: number[];
  nations: string[];
  classes: TankClass[];
  types: TankType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
  gunType: CaseType<GunDefinition>[];
}

export const initialTankFilters: TankFilters = {
  tiers: [],
  nations: [],
  classes: [],
  types: [],
  testing: 'include',
  search: undefined,
  searching: false,
  gunType: [],
};

export const $tankFilters = map<TankFilters>(initialTankFilters);
