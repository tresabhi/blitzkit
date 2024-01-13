import { produce } from 'immer';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { TankType, TreeTypeString } from '../components/Tanks';
import {
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  Tier,
  TurretDefinition,
} from '../core/blitzkrieg/tankDefinitions';

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
    showSpacedArmor: boolean;
  };
  mode: TankopediaMode;
} & (
  | {
      areTanksAssigned: true;
      protagonist: {
        tank: TankDefinition;
        turret: TurretDefinition;
        gun: GunDefinition;
        shell: ShellDefinition;
      };
      antagonist: {
        tank: TankDefinition;
        turret: TurretDefinition;
        gun: GunDefinition;
        shell: ShellDefinition;
      };
    }
  | { areTanksAssigned: false }
);

export const useTankopedia = create<Tankopedia>()(
  subscribeWithSelector<Tankopedia>(() => ({
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
      showSpacedArmor: true,
    },
    areTanksAssigned: false,
    mode: 'model',
  })),
);

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
