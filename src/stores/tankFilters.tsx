'use client';

import { produce } from 'immer';
import { createContext, ReactNode, useContext, useRef } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';

export interface TankFilters {
  tiers: Tier[];
  nations: string[];
  classes: TankClass[];
  types: TreeType[];
  testing: 'include' | 'exclude' | 'only';
  search?: string;
  searching: boolean;
}

export const tankFiltersInitialState: TankFilters = {
  testing: 'include',
  searching: false,
  classes: [],
  nations: [],
  tiers: [],
  types: [],
};

const createTankFiltersStore = (
  initialState: TankFilters = tankFiltersInitialState,
) => createStore<TankFilters>()(() => ({ ...initialState }));

const TankFiltersContext = createContext<StoreApi<TankFilters> | undefined>(
  undefined,
);

interface TankFiltersProviderProps {
  children: ReactNode;
}

export function TankFiltersProvider({ children }: TankFiltersProviderProps) {
  const storeRef = useRef<StoreApi<TankFilters>>();
  if (!storeRef.current) storeRef.current = createTankFiltersStore();

  return (
    <TankFiltersContext.Provider value={storeRef.current}>
      {children}
    </TankFiltersContext.Provider>
  );
}

export function useTankFiltersContext() {
  const context = useContext(TankFiltersContext);
  if (!context) {
    throw new Error('useTankFilters must be used within TankFiltersContext');
  }
  return context;
}

export function useTankFilters<Type = TankFilters>(
  selector: (store: TankFilters) => Type = (store) => store as Type,
): Type {
  const counterStoreContext = useTankFiltersContext();

  return useStore(counterStoreContext, selector);
}

export function useTankFiltersMutation() {
  const counterStoreContext = useTankFiltersContext();

  return function (recipe: (draft: TankFilters) => void) {
    counterStoreContext.setState(produce(recipe));
  };
}
