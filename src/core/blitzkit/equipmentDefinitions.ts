import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

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
      description: string;
    };
  };
}

export const equipmentDefinitions = fetchCdonLz4<EquipmentDefinitions>(
  asset('definitions/equipment.cdon.lz4'),
);
