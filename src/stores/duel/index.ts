'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { provisionDefinitions } from '../../core/blitzkit/provisionDefinitions';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  tankDefinitions,
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
  async (id: number) => {
    const awaitedTankDefinitions = await tankDefinitions;
    const awaitedProvisionDefinitions = await provisionDefinitions;
    const tank = awaitedTankDefinitions[id];
    const protagonist = tankToDuelMember(tank, awaitedProvisionDefinitions);

    return create<Duel>()(
      subscribeWithSelector<Duel>(() => ({
        protagonist,
        antagonist: protagonist,
      })),
    );
  },
);
