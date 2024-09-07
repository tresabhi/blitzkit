'use client';

import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from '@blitzkit/core';
import { ProvisionDefinitions } from '@blitzkit/core/src/blitzkit/provisionDefinitions';
import { createNextSafeStore } from '@blitzkit/core/src/zustand/createNextSafeStore';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tankToDuelMember } from '../../core/blitzkit/tankToDuelMember';

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
