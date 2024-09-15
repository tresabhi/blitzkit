import lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualSafeStore } from '../core/zustand/createContextualSafeStore';

export type DeltaMode = 'none' | 'percentage' | 'absolute';
export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const { Provider, use, useMutation, useStore } =
  createContextualSafeStore(() =>
    create<ComparePersistent>()(
      persist(
        subscribeWithSelector<ComparePersistent>(() => ({
          deltaMode: 'none',
        })),
        {
          name: 'compare',
          merge: (a, b) => lodash.merge(b, a),
        },
      ),
    ),
  );
