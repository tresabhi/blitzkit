import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../../core/zustand/createContextualStore';
import { PlayerCountPeriod } from './constants';

export interface TankPerformancePersistent {
  playerCountPeriod: PlayerCountPeriod;
}

export const { Provider, use, useMutation, useStore } = createContextualStore(
  () =>
    create<TankPerformancePersistent>()(
      persist(
        subscribeWithSelector<TankPerformancePersistent>(() => ({
          playerCountPeriod: PlayerCountPeriod.ThisMonth,
        })),
        { name: 'tank-performance', merge: (a, b) => lodash.merge(b, a) },
      ),
    ),
);
