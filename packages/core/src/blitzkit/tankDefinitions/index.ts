import { Vector2Tuple } from 'three';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';

export enum TankClass {
  Unspecified,
  Light,
  Medium,
  Heavy,
  TankDestroyer,
}
export enum TankType {
  Unspecified,
  Researchable,
  Premium,
  Collector,
}

export enum ShellType {
  Unspecified,
  AP,
  APCR,
  HEAT,
  HE,
}

export enum CrewType {
  Unspecified,
  Commander,
  Radioman,
  Gunner,
  Driver,
  Loader,
}

export type TankDefinitions = Record<number, TankDefinition>;
export enum ModuleType {
  Unspecified,
  Vehicle,
  Engine,
  Tracks,
  Turret,
  Gun,
}

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
  type: CrewType;
  count?: number;
  substitute?: CrewType[];
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
  fixed_camouflage: boolean;
  camouflages: number[];
  ancestors: number[];
  successors: number[];
  crew: Crew[];
  health: number;
  nation: string;
  name: string;
  nameFull?: string;
  type: TankType;
  max_consumables: number;
  max_provisions: number;
  tier: Tier;
  class: TankClass;
  testing: boolean;
  deprecated: boolean;
  turrets: TurretDefinition[];
  engines: EngineDefinition[];
  tracks: TrackDefinition[];
  price: TankPrice;
  xp?: number;
  speed_forwards: number;
  speed_backwards: number;
  camouflage_still: number;
  camouflage_moving: number;
  camouflage_onFire: number;
  equipment_preset: string;
  weight: number;
}
export interface TrackDefinition {
  id: number;
  tier: Tier;
  name: string;
  weight: number;
  traverse_speed: number;
  xp?: number;
  dispersion_move: number;
  dispersion_traverse: number;
  resistance_hard: number;
  resistance_medium: number;
  resistance_soft: number;
  unlocks?: Unlock[];
}
export interface EngineDefinition {
  id: number;
  name: string;
  xp?: number;
  tier: Tier;
  fire_chance: number;
  power: number;
  weight: number;
  unlocks?: Unlock[];
}
export type TankPrice = {
  type: TankPriceType;
  value: number;
};
enum TankPriceType {
  Unspecified,
  Credits,
  Gold,
}
export interface TurretDefinition {
  health: number;
  view_range: number;
  traverse_speed: number;
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
  rotation_speed: number;
  xp?: number;
  weight: number;
  id: number;
  name: string;
  tier: Tier;
  shells: ShellDefinition[];
  camouflage_loss: number;
  aim_time: number;
  dispersion_base: number;
  dispersion_traverse: number;
  dispersion_shot: number;
  dispersion_damaged: number;
  unlocks?: Unlock[];
}
interface GunDefinitionRegular {
  gun: GunDefinitionBase;
  regular: GunDefinitionRegularProperties;
}
interface GunDefinitionRegularProperties {
  reload: number;
}
interface GunDefinitionAutoLoader {
  gun: GunDefinitionBase;
  auto_loader: GunDefinitionAutoLoaderProperties;
}
interface GunDefinitionAutoLoaderProperties {
  reload: number;
  intra_clip: number;
  count: number;
}
interface GunDefinitionAutoReloader {
  gun: GunDefinitionBase;
  auto_reloader: GunDefinitionAutoReloaderProperties;
}
interface GunDefinitionAutoReloaderProperties {
  reload: number[];
  intraClip: number;
  count: number;
}
export interface ShellDefinition {
  id: number;
  name: string;
  velocity: number;
  armor_damage: number;
  module_damage: number;
  caliber: number;
  icon: string;
  penetration: number | Vector2Tuple;
  type: ShellType;
  normalization?: number;
  ricochet?: number;
  explosion_radius?: number;
}

export const tankDefinitions = fetchCdonLz4<TankDefinitions>(
  asset('definitions/tanks.cdon.lz4'),
);

export const tankDefinitionsArray = tankDefinitions.then((tanks) =>
  Object.values(tanks),
);
export enum Tier {
  Unspecified,
  I,
  II,
  III,
  IV,
  V,
  VI,
  VII,
  VIII,
  IX,
  X,
}

export * from './constants';
