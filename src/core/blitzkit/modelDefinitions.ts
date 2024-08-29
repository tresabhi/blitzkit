import { Vector3Tuple } from 'three';
import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

export type ModelDefinitions = Record<number, ModelDefinition>;

export interface ModelArmor {
  thickness: Record<number, number>;
  spaced?: number[];
  // dynamic?: Record<`${boolean}`, number[]>;
}

export interface BoundingBox {
  min: Vector3Tuple;
  max: Vector3Tuple;
}
export interface ModelDefinition {
  armor: ModelArmor;
  turretOrigin: Vector3Tuple;
  turretRotation?: InitialTurretRotation;
  turrets: Record<number, TurretModelDefinition>;
  tracks: Record<number, TrackDefinition>;
  boundingBox: BoundingBox;
}
interface TrackDefinition {
  thickness: number;
  origin: Vector3Tuple;
}
export interface InitialTurretRotation {
  yaw: number;
  pitch: number;
  roll: number;
}
interface TurretModelDefinition {
  boundingBox: BoundingBox;
  armor: ModelArmor;
  model: number;
  gunOrigin: Vector3Tuple;
  guns: Record<number, GunModelDefinition>;
  yaw?: YawLimits;
}
export interface YawLimits {
  min: number;
  max: number;
}
interface GunModelDefinition {
  armor: ModelArmor;
  thickness: number;
  model: number;
  pitch: PitchLimits;
  mask?: number;
}
export interface PitchLimits {
  min: number;
  max: number;

  front?: { min: number; max: number; range: number };
  back?: { min: number; max: number; range: number };
  transition?: number;
}

export const modelDefinitions = fetchCdonLz4<ModelDefinitions>(
  asset('definitions/models.cdon.lz4'),
);
