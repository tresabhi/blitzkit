'use client';

import { Tier, createNextSafeStore } from '@blitzkit/core';
import { create } from 'zustand';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TreeType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<TankFilters>()(() => ({
      tiers: [],
      nations: [],
      classes: [],
      types: [],
      testing: 'include',
      search: undefined,
      searching: false,
    })),
);
