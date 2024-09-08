'use client';

import { create } from 'zustand';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';
import {
  TankopediaSortBy,
  TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<TankopediaSort>()(() => ({
      by: 'meta.none',
      direction: 'descending',
    })),
);
