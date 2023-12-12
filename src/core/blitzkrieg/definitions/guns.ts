import { asset } from '../asset';

export interface BlitzkriegGunDefinition {
  id: number;
  name: string;
  tier: number;
  pitch: [number, number];
  shells: number[];
}

export type BlitzkriegGunDefinitions = Record<number, BlitzkriegGunDefinition>;

export const gunDefinitions = fetch(asset('definitions/guns.json'), {
  cache: 'no-cache',
}).then(
  async (response) => response.json() as Promise<BlitzkriegGunDefinitions>,
);
