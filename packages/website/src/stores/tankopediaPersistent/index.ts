import { TankClass, Tier, TreeType } from '@blitzkit/core';
import lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { ENVIRONMENTS } from '../../constants/lightingEnvironments';
import { createContextualSafeStore } from '../../core/zustand/createContextualSafeStore';
import { SORT_NAMES, TankopediaDisplay } from './constants';

export type TankopediaSortBy = keyof typeof SORT_NAMES;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';
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
      showExternalModules: boolean;
      showPrimaryArmor: boolean;
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
  display: TankopediaDisplay;
}

export const { Provider, use, useMutation, useStore } =
  createContextualSafeStore(() =>
    create<TankopediaPersistent>()(
      persist(
        subscribeWithSelector<TankopediaPersistent>(() => ({
          model: {
            visual: {
              showSpacedArmor: true,
              showExternalModules: true,
              showPrimaryArmor: true,
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
          display: TankopediaDisplay.Model,
        })),
        { name: 'tankopedia', merge: (a, b) => lodash.merge(b, a) },
      ),
    ),
  );
