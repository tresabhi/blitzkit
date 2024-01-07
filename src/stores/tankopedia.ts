import { produce } from 'immer';
import { create } from 'zustand';
import { TankType, TreeTypeString } from '../components/Tanks';
import { Tier } from '../core/blitzkrieg/tankDefinitions';

export type TankopediaSortBy = 'tier' | 'name';
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';
export type TankopediaMode = 'model' | 'armor';

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
  model: {
    hullYaw: number;
    turretYaw: number;
    gunPitch: number;
    controlsEnabled: boolean;
    showGrid: boolean;
  };
  mode: TankopediaMode;
};

export const useTankopedia = create<Tankopedia>()(() => ({
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
  model: {
    gunPitch: 0,
    hullYaw: 0,
    turretYaw: 0,
    controlsEnabled: true,
    showGrid: true,
  },
  mode: 'model',
}));

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
