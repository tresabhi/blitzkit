'use client';

import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TreeType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const { Provider, use, useMutation, useStore } =
  createNextSafeStore<TankFilters>({
    tiers: [],
    nations: [],
    classes: [],
    types: [],
    testing: 'include',
    search: undefined,
    searching: false,
  });
