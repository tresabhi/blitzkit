export interface BlitzkriegGunDefinition {
  id: number;
  name: string;
  tier: number;
  pitch: [number, number];
}

export type BlitzkriegGunDefinitions = Record<number, BlitzkriegGunDefinition>;
