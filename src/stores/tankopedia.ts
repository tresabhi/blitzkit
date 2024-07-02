import { produce } from 'immer';
import { merge } from 'lodash';
import { Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { ENVIRONMENTS } from '../app/tools/tankopedia/[id]/components/Lighting';
import { ArmorType } from '../components/Armor/components/SpacedArmorScene';
import { ExternalModuleVariant } from '../components/Armor/components/SpacedArmorSceneComponent';
import { TankClass, TreeType } from '../components/Tanks';
import { Tier } from '../core/blitzkit/tankDefinitions';

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
  controlsEnabled: boolean;
}

export interface ShotLayerBase {
  index: number;
  thickness: number;
  point: Vector3;
  surfaceNormal: Vector3;
  status: 'blocked' | 'penetration' | 'ricochet';
}

interface ShotLayerExternal extends ShotLayerBase {
  type: ArmorType.External;
  variant: ExternalModuleVariant;
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
  containsGaps: boolean;
  damage: number;

  in: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
  out?: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
};

export type ShotStatus = 'penetration' | 'blocked' | 'ricochet' | 'splash';

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
  'meta.none': 'none',
  'survivability.health': 'health',
  'survivability.viewRange': 'view range',
  'survivability.camouflageStill': 'camouflage still',
  'survivability.camouflageMoving': 'camouflage moving',
  'survivability.camouflageShooting': 'camouflage shooting',
  'survivability.volume': 'volume',
  'survivability.length': 'length',
  'fire.dpm': 'standard DPM',
  'fire.dpmPremium': 'premium DPM',
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

export const SORT_UNITS: Record<TankopediaSortBy, string | undefined> = {
  'meta.none': undefined,
  'survivability.health': 'hp',
  'fire.aimTime': 's',
  'fire.caliber': 'mm',
  'fire.damage': 'hp',
  'fire.dispersionMoving': 'm',
  'fire.dispersionStill': 'm',
  'fire.dpm': undefined,
  'fire.dpmPremium': undefined,
  'fire.gunDepression': '°',
  'fire.gunElevation': '°',
  'fire.premiumPenetration': 'mm',
  'fire.reload': 's',
  'fire.shellVelocity': 'm/s',
  'fire.standardPenetration': 'mm',
  'maneuverability.backwardsSpeed': 'kph',
  'maneuverability.forwardsSpeed': 'kph',
  'maneuverability.power': 'hp',
  'maneuverability.powerToWeight': 'hp/tn',
  'maneuverability.traverseSpeed': '°/s',
  'maneuverability.weight': 'tn',
  'survivability.camouflageMoving': '%',
  'survivability.camouflageShooting': '%',
  'survivability.camouflageStill': '%',
  'survivability.length': 'm',
  'survivability.viewRange': 'm',
  'survivability.volume': 'm^3',
};

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
        by: 'meta.none',
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
    controlsEnabled: true,
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
