import { TankClass, Tier, TreeType } from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualSafeStore } from '../core/zustand/createContextualSafeStore';

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
  createContextualSafeStore(() =>
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
