import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../../core/zustand/createContextualStore';
import { SORT_NAMES } from './constants';

export type TankopediaSortBy = keyof typeof SORT_NAMES;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';

export interface TankopediaPersistentStore {
  wireframe: boolean;
  opaque: boolean;
  advancedHighlighting: boolean;
  showGrid: boolean;
  greenPenetration: boolean;
  showSpacedArmor: boolean;
  showExternalModules: boolean;
  showPrimaryArmor: boolean;
  recentlyViewed: number[];

  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
}

export const TankopediaPersistent = createContextualStore(() =>
  create<TankopediaPersistentStore>()(
    persist(
      subscribeWithSelector<TankopediaPersistentStore>(() => ({
        wireframe: false,
        opaque: false,
        advancedHighlighting: false,
        showGrid: true,
        greenPenetration: false,
        showSpacedArmor: true,
        showExternalModules: true,
        showPrimaryArmor: true,
        recentlyViewed: [],
        sort: {
          by: 'meta.none',
          direction: 'ascending',
        },
      })),
      { name: 'tankopedia', merge: (a, b) => lodash.merge(b, a) },
    ),
  ),
);
