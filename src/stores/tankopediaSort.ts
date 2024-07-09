'use client';

import { createNextSafeStore } from '../core/zustand/createNextSafeStore';
import { TankopediaSortBy, TankopediaSortDirection } from './tankopedia';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const { Provider, use, useMutation, useStore } =
  createNextSafeStore<TankopediaSort>({
    by: 'meta.none',
    direction: 'descending',
  });
