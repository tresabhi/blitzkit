import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TankType, TreeTypeString } from '../components/Tanks';
import { Tier } from '../core/blitzkrieg/definitions/tanks';

export type TankopediaSortBy = 'tier' | 'name';
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';

type Tankopedia = {
  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
  filters: {
    tiers: Tier[];
    types: TankType[];
    treeTypes: TreeTypeString[];
    nations: string[];
    test: TankopediaTestTankDisplay;
  };
};

export const useTankopedia = create<Tankopedia>()(
  devtools(
    persist(
      (set) => ({
        sort: {
          by: 'tier',
          direction: 'descending',
        },
        filters: {
          tiers: [],
          types: [],
          treeTypes: [],
          nations: [],
          test: 'include',
        },
      }),
      { name: 'tankopedia' },
    ),
  ),
);

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
