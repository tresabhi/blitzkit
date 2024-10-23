import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

export type DeltaMode = 'none' | 'percentage' | 'absolute';
export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const ComparePersistent = createContextualStore(() =>
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
