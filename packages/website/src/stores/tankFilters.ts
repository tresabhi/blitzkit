'use client';

import { TankClass, Tier, TreeType } from '@blitzkit/core';
import { create } from 'zustand';
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
