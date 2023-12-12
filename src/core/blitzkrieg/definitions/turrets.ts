export interface BlitzkriegTurretDefinition {
  id: number;
  name: string;
  tier: number;
  yaw: [number, number];
  guns: number[];
}

export type BlitzkriegTurretDefinitions = Record<
  number,
  BlitzkriegTurretDefinition
>;
