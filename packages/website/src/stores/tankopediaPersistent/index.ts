import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ENVIRONMENTS } from '../../constants/lightingEnvironments';
import { createContextualStore } from '../../core/zustand/createContextualStore';
import { SORT_NAMES, TankopediaDisplay } from './constants';

export type TankopediaSortBy = keyof typeof SORT_NAMES;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';

export interface TankopediaPersistentStore {
  wireframe: boolean;
  opaque: boolean;
  environment: (typeof ENVIRONMENTS)[number];
  showGrid: boolean;
  greenPenetration: boolean;
  showEnvironment: boolean;
  showSpacedArmor: boolean;
  showExternalModules: boolean;
  showPrimaryArmor: boolean;

  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };

  display: TankopediaDisplay;
}

export const TankopediaPersistent = createContextualStore(() =>
  create<TankopediaPersistentStore>()(
    persist(
      (set) => ({
        wireframe: false,
        opaque: false,
        environment: ENVIRONMENTS[0],
        showGrid: true,
        greenPenetration: true,
        showEnvironment: true,
        showSpacedArmor: true,
        showExternalModules: true,
        showPrimaryArmor: true,
        sort: {
          by: 'meta.none',
          direction: 'ascending',
        },
        display: TankopediaDisplay.Model,
      }),
      { name: 'tankopedia', merge: (a, b) => lodash.merge(b, a) },
    ),
  ),
);
