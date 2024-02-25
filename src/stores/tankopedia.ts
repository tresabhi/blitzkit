import { produce } from 'immer';
import { merge } from 'lodash';
import { Vector3Tuple } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { ENVIRONMENTS } from '../app/tools/tankopedia/[id]/components/Lighting';
import { TankType, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkrieg/tankDefinitions';

export type TankopediaSortBy = keyof typeof SORT_NAMES;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';
export type TankopediaMode = 'model' | 'armor';

interface TankopediaPersistent {
  model: {
    visual: {
      wireframe: boolean;
      environment: (typeof ENVIRONMENTS)[number];
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
  mode: TankopediaMode;
}

interface TankopediaTemporary {
  shot?: Shot;
}

export interface Shot {
  point: Vector3Tuple;
  surfaceNormal: Vector3Tuple;
  shellNormal: Vector3Tuple;
  thicknesses: ArmorPiercingLayer[];
  type: 'ricochet' | 'penetration' | 'block';
  angle: number;
  ricochet?: {
    distance: number;
    point: Vector3Tuple;
    penetration: boolean;
  };
}

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
  'survivability.size': 'size',
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
          wireframe: false,
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
    { name: 'tankopedia', merge },
  ),
);

export const useTankopediaTemporary = create<TankopediaTemporary>()(
  subscribeWithSelector<TankopediaTemporary>(() => ({})),
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
