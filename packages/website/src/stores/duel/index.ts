import { Gun, Tank, Turret } from '@blitzkit/core';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tankToDuelMember } from '../../core/blitzkit/tankToDuelMember';
import { createContextualStore } from '../../core/zustand/createContextualStore';

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
  tank: Tank;
  // engine: EngineDefinition;
  turret: Turret;
  gun: Gun;
  // shell: ShellDefinition;
  // track: TrackDefinition;
  // equipmentMatrix: EquipmentMatrix;
  // pitch: number;
  // yaw: number;
  // consumables: number[];
  // provisions: number[];
  // camouflage: boolean;
  // cooldownBooster: number;
}

export interface DuelStore {
  protagonist: DuelMember;
  antagonist: DuelMember;
}

export const Duel = createContextualStore(
  ({
    tank,
    // provisionDefinitions,
  }: {
    tank: Tank;
    // provisionDefinitions: ProvisionDefinitions;
  }) => {
    const protagonist = tankToDuelMember(
      tank, // provisionDefinitions
    );

    return create<DuelStore>()(
      subscribeWithSelector<DuelStore>(() => ({
        protagonist,
        antagonist: protagonist,
      })),
    );
  },
);
