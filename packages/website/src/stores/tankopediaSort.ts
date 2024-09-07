'use client';

import { createNextSafeStore } from '@blitzkit/core';
import { create } from 'zustand';
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
