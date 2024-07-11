'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ProvisionDefinitions } from '../../core/blitzkit/provisionDefinitions';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from '../../core/blitzkit/tankDefinitions';
import { tankToDuelMember } from '../../core/blitzkit/tankToDuelMember';
import { createNextSafeStore } from '../../core/zustand/createNextSafeStore';

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
  equipmentMatrix: EquipmentMatrix;
  pitch: number;
  yaw: number;
  consumables: number[];
  crewMastery: number;
  provisions: number[];
  camouflage: boolean;
  cooldownBooster: number;
}

export interface Duel {
  protagonist: DuelMember;
  antagonist: DuelMember;
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  ({
    tank,
    provisionDefinitions,
  }: {
    tank: TankDefinition;
    provisionDefinitions: ProvisionDefinitions;
  }) => {
    const protagonist = tankToDuelMember(tank, provisionDefinitions);

    return create<Duel>()(
      subscribeWithSelector<Duel>(() => ({
        protagonist,
        antagonist: protagonist,
      })),
    );
  },
);
