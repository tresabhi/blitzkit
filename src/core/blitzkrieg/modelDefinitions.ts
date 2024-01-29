import { Vector3Tuple } from 'three';
import { asset } from './asset';

export type ModelDefinitions = Record<number, ModelDefinition>;

export interface ModelArmor {
  thickness: Record<number, number>;
  spaced?: number[];
}

interface BoundingBox {
  min: Vector3Tuple;
  max: Vector3Tuple;
}
interface ModelDefinition {
  armor: ModelArmor;
  trackThickness: number;
  turretOrigin: Vector3Tuple;
  hullOrigin: Vector3Tuple;
  turretRotation?: InitialTurretRotation;
  turrets: Record<number, TurretModelDefinition>;
  boundingBox: BoundingBox;
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
  barrelThickness: number;
  model: number;
  pitch: PitchLimits;
}
export interface PitchLimits {
  min: number;
  max: number;

  front?: { min: number; max: number; range: number };
  back?: { min: number; max: number; range: number };
  transition?: number;
}

export const modelDefinitions = fetch(asset('definitions/models.json'), {
  cache: 'no-cache',
}).then(async (response) => response.json() as Promise<ModelDefinitions>);
