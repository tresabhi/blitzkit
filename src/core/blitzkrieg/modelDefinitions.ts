import { Vector3Tuple } from 'three';
import { asset } from './asset';

export type ModelDefinitions = Record<number, ModelDefinition>;
interface ModelDefinition {
  turretOrigin: Vector3Tuple;
  turrets: Record<number, TurretModelDefinition>;
}
interface TurretModelDefinition {
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
