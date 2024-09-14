'use client';

import { merge } from 'lodash';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';

export type DeltaMode = 'none' | 'percentage' | 'absolute';
export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<ComparePersistent>()(
      persist(
        subscribeWithSelector<ComparePersistent>(() => ({
          deltaMode: 'none',
        })),
        {
          name: 'compare',
          merge: (a, b) => merge(b, a),
        },
      ),
    ),
);
