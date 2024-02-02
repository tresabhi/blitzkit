import { produce } from 'immer';
import { Vector3Tuple } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { TankType, TreeType } from '../components/Tanks';
import {
  EngineDefinition,
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
  engine: EngineDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;
}
interface TankopediaPersistent {
  model: {
    equipment: {
      enhancedArmor: boolean;
      calibratedShells: boolean;
    };
    visual: {
      controlsEnabled: boolean;
      showGrid: boolean;
      greenPenetration: boolean;
      showEnvironment: boolean;
    };
  };
  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
  filters: {
    tiers: Tier[];
    types: TankType[];
    treeTypes: TreeType[];
    nations: string[];
    test: TankopediaTestTankDisplay;
    page: number;
  };
}

export type EquipmentMatrix = (-1 | 0 | 1)[][];

interface TankopediaTemporary {
  model: {
    pose: {
      yaw: number;
      pitch: number;
    };
  };
  equipmentMatrix: EquipmentMatrix;
  mode: TankopediaMode;
  consumables: number[];
  provisions: number[];
  camouflage: boolean;
  shot?: Shot;
}

export type Shot = {
  point: Vector3Tuple;
  surfaceNormal: Vector3Tuple;
  shellNormal: Vector3Tuple;
  thicknesses: ArmorPiercingLayer[];
  type: 'ricochet' | 'penetration' | 'block';
  angle: number;
};

export interface ArmorPiercingLayer {
  nominal: number;
  angled: number;
  ricochet: boolean;
  block: boolean;
  type: 'core' | 'spaced' | 'external';
}

export const useTankopediaPersistent = create<TankopediaPersistent>()(
  persist(
    subscribeWithSelector<TankopediaPersistent>(() => ({
      model: {
        equipment: {
          enhancedArmor: false,
          calibratedShells: false,
        },
        visual: {
          controlsEnabled: true,
          showGrid: true,
          greenPenetration: false,
          showEnvironment: false,
        },
      },
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
        page: 0,
      },
    })),
    { name: 'tankopedia' },
  ),
);

export const useTankopediaTemporary = create<TankopediaTemporary>()(
  subscribeWithSelector<TankopediaTemporary>(() => ({
    model: {
      pose: {
        yaw: 0,
        pitch: 0,
      },
    },
    equipmentMatrix: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    mode: 'model',
    consumables: [],
    provisions: [],
    camouflage: false,
  })),
);

export default function mutateTankopediaPersistent(
  recipe: (draft: TankopediaPersistent) => void,
) {
  useTankopediaPersistent.setState(produce(recipe));
}

export function mutateTankopediaTemporary(
  recipe: (draft: TankopediaTemporary) => void,
) {
  useTankopediaTemporary.setState(produce(recipe));
}
