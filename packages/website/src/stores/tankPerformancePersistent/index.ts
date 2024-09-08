'use client';

import { merge } from 'lodash';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createNextSafeStore } from '../../core/zustand/createNextSafeStore';
import { PlayerCountPeriod } from './constants';

export interface TankPerformancePersistent {
  playerCountPeriod: PlayerCountPeriod;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<TankPerformancePersistent>()(
      persist(
        subscribeWithSelector<TankPerformancePersistent>(() => ({
          playerCountPeriod: PlayerCountPeriod.ThisMonth,
        })),
        { name: 'tank-performance', merge: (a, b) => merge(b, a) },
      ),
    ),
);
