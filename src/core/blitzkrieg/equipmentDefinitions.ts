import { asset } from './asset';
import { fetchBkonLz4 } from './fetchBkonLz4';

type EquipmentOptions = [number, number];

export type EquipmentRow = [
  EquipmentOptions,
  EquipmentOptions,
  EquipmentOptions,
];

export type EquipmentPreset = [EquipmentRow, EquipmentRow, EquipmentRow];

export interface EquipmentDefinitions {
  presets: {
    [key: string]: EquipmentPreset;
  };
  equipments: {
    [key: number]: {
      name: string;
    };
  };
}

export const equipmentDefinitions = fetchBkonLz4<EquipmentDefinitions>(
  asset('definitions/equipment.bkon.lz4'),
);
