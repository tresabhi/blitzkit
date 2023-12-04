import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TankopediaSortBy = 'tier' | 'name';
export type TankopediaSortDirection = 'ascending' | 'descending';

type Tankopedia = {
  sortBy: TankopediaSortBy;
  sortDirection: TankopediaSortDirection;
};

export const useTankopedia = create<Tankopedia>()(
  devtools(
    persist(
      (set) => ({
        sortBy: 'tier',
        sortDirection: 'descending',
      }),
      { name: 'tankopedia' },
    ),
  ),
);

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
