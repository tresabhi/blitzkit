import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TIERS, Tier } from '../core/blitzkrieg/tankopedia';

export type TankopediaSortBy = 'tier' | 'name';
export type TankopediaSortDirection = 'ascending' | 'descending';

type Tankopedia = {
  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
  filters: {
    tiers: Tier[];
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
          tiers: [...TIERS],
        },
      }),
      { name: 'tankopedia' },
    ),
  ),
);

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
