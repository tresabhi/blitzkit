import { Vector2Tuple } from 'three';
import { TankClass, TreeType } from '../../../components/Tanks';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';
import { TIERS } from './constants';

export enum ShellType {
  AP = 'ap',
  APCR = 'ap_cr',
  HEAT = 'hc',
  HE = 'he',
}

export type CrewMember =
  | 'commander'
  | 'radioman'
  | 'gunner'
  | 'driver'
  | 'loader';
export type TankDefinitions = Record<number, TankDefinition>;
export type ModuleType = 'vehicle' | 'engine' | 'chassis' | 'turret' | 'gun';
export interface Unlock {
  type: ModuleType;
  id: number;
  cost: {
    // string being the season coins
    type: 'xp' | string;
    value: number;
  };
}
export interface Crew {
  type: CrewMember;
  count?: number;
  substitute?: CrewMember[];
}
export type ModuleDefinition =
  | TrackDefinition
  | EngineDefinition
  | TurretDefinition
  | GunDefinition;
export interface TankDefinition {
  id: number;
  roles: Record<number, number>;
  description?: string;
  fixedCamouflage?: boolean;
  camouflages?: number[];
  ancestors?: number[];
  successors?: number[];
  crew: Crew[];
  health: number;
  nation: string;
  name: string;
  nameFull?: string;
  treeType: TreeType;
  consumables: number;
  provisions: number;
  tier: Tier;
  class: TankClass;
  testing: boolean;
  deprecated: boolean;
  turrets: TurretDefinition[];
  engines: EngineDefinition[];
  tracks: TrackDefinition[];
  price: TankPrice;
  xp?: number;
  speed: {
    forwards: number;
    backwards: number;
  };
  camouflage: {
    still: number;
    moving: number;
    onFire: number;
  };
  equipment: string;
  weight: number;
}
export interface TrackDefinition {
  id: number;
  tier: Tier;
  name: string;
  weight: number;
  traverseSpeed: number;
  xp?: number;
  dispersion: {
    move: number;
    traverse: number;
  };
  resistance: {
    hard: number;
    medium: number;
    soft: number;
  };
  unlocks?: Unlock[];
}
export interface EngineDefinition {
  id: number;
  name: string;
  xp?: number;
  tier: Tier;
  fireChance: number;
  power: number;
  weight: number;
  unlocks?: Unlock[];
}
export type TankPrice =
  | { type: 'credits'; value: number }
  | { type: 'gold'; value: number };
export interface TurretDefinition {
  health: number;
  viewRange: number;
  traverseSpeed: number;
  xp?: number;
  id: number;
  name: string;
  tier: Tier;
  guns: GunDefinition[];
  weight: number;
  unlocks?: Unlock[];
}
export type GunDefinition =
  | GunDefinitionRegular
  | GunDefinitionAutoLoader
  | GunDefinitionAutoReloader;
interface GunDefinitionBase {
  rotationSpeed: number;
  xp?: number;
  weight: number;
  id: number;
  name: string;
  tier: Tier;
  shells: ShellDefinition[];
  camouflageLoss: number;
  aimTime: number;
  dispersion: {
    base: number;
    traverse: number;
    shot: number;
    damaged: number;
  };
  unlocks?: Unlock[];
}
interface GunDefinitionRegular extends GunDefinitionBase {
  type: 'regular';
  reload: number;
}
interface GunDefinitionAutoLoader extends GunDefinitionBase {
  type: 'autoLoader';
  reload: number;
  intraClip: number;
  count: number;
}
interface GunDefinitionAutoReloader extends GunDefinitionBase {
  type: 'autoReloader';
  reload: number[];
  intraClip: number;
  count: number;
}
export type ShellDefinition = {
  id: number;
  name: string;
  speed: number;
  damage: { armor: number; module: number };
  caliber: number;
  icon: string;
  penetration: number | Vector2Tuple;
  type: ShellType;
  normalization?: number;
  ricochet?: number;
  explosionRadius?: number;
};

export const tankDefinitions = fetchCdonLz4<TankDefinitions>(
  asset('definitions/tanks.cdon.lz4'),
);

export const tankDefinitionsArray = tankDefinitions.then((tanks) =>
  Object.values(tanks),
);
export type Tier = (typeof TIERS)[number];

export * from './constants';
