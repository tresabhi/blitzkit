import lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualSafeStore } from '../../core/zustand/createContextualSafeStore';
import { PlayerCountPeriod } from './constants';

export interface TankPerformancePersistent {
  playerCountPeriod: PlayerCountPeriod;
}

export const { Provider, use, useMutation, useStore } =
  createContextualSafeStore(() =>
    create<TankPerformancePersistent>()(
      persist(
        subscribeWithSelector<TankPerformancePersistent>(() => ({
          playerCountPeriod: PlayerCountPeriod.ThisMonth,
        })),
        { name: 'tank-performance', merge: (a, b) => lodash.merge(b, a) },
      ),
    ),
  );
