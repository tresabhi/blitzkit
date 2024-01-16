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
export interface DuelMember {
  tank: TankDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;
}
interface Tankopedia {
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
    physical: {
      yaw: number;
      pitch: number;
    };
    visual: {
      controlsEnabled: boolean;
      showGrid: boolean;
      greenPenetration: boolean;
    };
  };
  equipmentMatrix: (0 | 1)[][];
  mode: TankopediaMode;
}

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
      physical: {
        yaw: 0,
        pitch: 0,
      },
      visual: {
        controlsEnabled: true,
        showGrid: true,
        greenPenetration: false,
      },
    },
    equipmentMatrix: [
      [1, 0, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    mode: 'model',
  })),
);

export default function mutateTankopedia(recipe: (draft: Tankopedia) => void) {
  useTankopedia.setState(produce(recipe));
}
