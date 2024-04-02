import { produce } from 'immer';
import { merge } from 'lodash';
import { Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { ENVIRONMENTS } from '../app/tools/tankopedia/[id]/components/Lighting';
import { ArmorType } from '../components/Armor/components/SpacedArmorScene';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkrieg/tankDefinitions';

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
      controlsEnabled: boolean;
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

interface TankopediaTemporary {
  shot?: Shot;
  skills: Record<string, number>;
}

export interface ShotLayerBase {
  index: number;
  thickness: number;
  point: Vector3;
  shellNormal: Vector3;
  surfaceNormal: Vector3;
  status: 'blocked' | 'penetration' | 'ricochet';
}

interface ShotLayerExternal extends ShotLayerBase {
  type: ArmorType.External;
}

export interface ShotLayerNonExternal extends ShotLayerBase {
  type: Exclude<ArmorType, ArmorType.External>;
  angle: number;
  thicknessAngled: number;
}

export interface ShotLayerGap {
  type: null;
  status: 'penetration' | 'blocked';
  distance: number;
}

export type ShotLayer = ShotLayerExternal | ShotLayerNonExternal | ShotLayerGap;

export type Shot = {
  point: Vector3;
  layers: ShotLayer[];
};

export type ArmorPiercingLayer =
  | {
      distance: number;
      nominal: number;
      angled: number;
      ricochet: boolean;
      type: 'core' | 'spaced' | 'external';
    }
  | {
      type: 'gap';
      gap: number;
    };

export const SORT_NAMES = {
  'meta.tier': 'tier',
  'meta.name': 'name',
  'survivability.health': 'health',
  'survivability.viewRange': 'view range',
  'survivability.camouflageStill': 'camouflage still',
  'survivability.camouflageMoving': 'camouflage moving',
  'survivability.camouflageShooting': 'camouflage shooting',
  'survivability.volume': 'volume',
  'survivability.length': 'length',
  'fire.dpm': 'DPM',
  'fire.reload': 'reload',
  'fire.caliber': 'caliber',
  'fire.standardPenetration': 'standard penetration',
  'fire.premiumPenetration': 'premium penetration',
  'fire.damage': 'damage',
  'fire.shellVelocity': 'shell velocity',
  'fire.aimTime': 'aim time',
  'fire.dispersionStill': 'dispersion still',
  'fire.dispersionMoving': 'dispersion moving',
  'fire.gunDepression': 'gun depression',
  'fire.gunElevation': 'gun elevation',
  'maneuverability.forwardsSpeed': 'forwards speed',
  'maneuverability.backwardsSpeed': 'backwards speed',
  'maneuverability.power': 'power',
  'maneuverability.powerToWeight': 'power to weight',
  'maneuverability.weight': 'weight',
  'maneuverability.traverseSpeed': 'traverse speed',
} as const;

export const useTankopediaPersistent = create<TankopediaPersistent>()(
  persist(
    subscribeWithSelector<TankopediaPersistent>(() => ({
      model: {
        visual: {
          showSpacedArmor: true,
          wireframe: false,
          opaque: false,
          environment: ENVIRONMENTS[0],
          controlsEnabled: true,
          showGrid: true,
          greenPenetration: false,
          showEnvironment: false,
        },
      },
      sort: {
        by: 'meta.tier',
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
);

export const useTankopediaTemporary = create<TankopediaTemporary>()(
  subscribeWithSelector<TankopediaTemporary>(() => ({
    skills: {},
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
