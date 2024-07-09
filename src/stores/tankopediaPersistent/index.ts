import { merge } from 'lodash';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { ENVIRONMENTS } from '../../app/tools/tankopedia/[id]/components/Lighting';
import { TankClass, TreeType } from '../../components/Tanks';
import { Tier } from '../../core/blitzkit/tankDefinitions';
import { createNextSafeStore } from '../../core/zustand/createNextSafeStore';
import { SORT_NAMES } from './constants';

export type TankopediaSortBy = keyof typeof SORT_NAMES;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';
export type TankopediaMode = 'model' | 'armor';

export interface TankopediaPersistent {
  model: {
    visual: {
      wireframe: boolean;
      opaque: boolean;
      environment: (typeof ENVIRONMENTS)[number];
      showGrid: boolean;
      greenPenetration: boolean;
      showEnvironment: boolean;
      showSpacedArmor: boolean;
    };
  };
  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
  filters: {
    tiers: Tier[];
    types: TankClass[];
    treeTypes: TreeType[];
    nations: string[];
    test: TankopediaTestTankDisplay;
    page: number;
  };
  mode: TankopediaMode;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<TankopediaPersistent>()(
      persist(
        subscribeWithSelector<TankopediaPersistent>(() => ({
          model: {
            visual: {
              showSpacedArmor: true,
              wireframe: false,
              opaque: false,
              environment: ENVIRONMENTS[0],
              showGrid: true,
              greenPenetration: false,
              showEnvironment: false,
            },
          },
          sort: {
            by: 'meta.none',
            direction: 'descending',
          },
          filters: {
            tiers: [],
            types: [],
            treeTypes: [],
            nations: [],
            test: 'include',
            page: 0,
          },
          mode: 'model',
        })),
        { name: 'tankopedia', merge: (a, b) => merge(b, a) },
      ),
    ),
);
