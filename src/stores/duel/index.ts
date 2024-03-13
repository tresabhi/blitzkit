import { produce } from 'immer';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from '../../core/blitzkrieg/tankDefinitions';

type EquipmentMatrixItem = -1 | 0 | 1;
type EquipmentMatrixRow = [
  EquipmentMatrixItem,
  EquipmentMatrixItem,
  EquipmentMatrixItem,
];
export type EquipmentMatrix = [
  EquipmentMatrixRow,
  EquipmentMatrixRow,
  EquipmentMatrixRow,
];

export interface DuelMember {
  tank: TankDefinition;
  engine: EngineDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;
  track: TrackDefinition;
  equipment: EquipmentMatrix;
  pitch: number;
  yaw: number;
  consumables: number[];
  crewMastery: number;
  provisions: number[];
  camouflage: boolean;
  cooldownBooster: number;
}

export interface Duel {
  assigned: boolean;
  protagonist?: DuelMember;
  antagonist?: DuelMember;
}

export const useDuel = create<Duel>()(
  subscribeWithSelector<Duel>(() => ({
    assigned: false,
  })),
);

export function mutateDuel(recipe: (draft: Duel) => void) {
  useDuel.setState(produce(recipe));
}
