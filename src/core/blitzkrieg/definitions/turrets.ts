import { asset } from '../asset';
import { Tier } from './tanks';

export interface BlitzkriegTurretDefinition {
  id: number;
  name: string;
  tier: Tier;
  yaw: [number, number];
  guns: number[];
}

export type BlitzkriegTurretDefinitions = Record<
  number,
  BlitzkriegTurretDefinition
>;

export const turretDefinitions = fetch(asset('definitions/turrets.json'), {
  cache: 'no-cache',
}).then(
  async (response) => response.json() as Promise<BlitzkriegTurretDefinitions>,
);
