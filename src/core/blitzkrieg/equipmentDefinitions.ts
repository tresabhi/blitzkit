import { asset } from './asset';

type EquipmentOptions = [number, number];

export type EquipmentRow = [
  EquipmentOptions,
  EquipmentOptions,
  EquipmentOptions,
];

export type EquipmentRows = [EquipmentRow, EquipmentRow, EquipmentRow];

export interface EquipmentDefinitions {
  presets: {
    [key: string]: EquipmentRows;
  };
  equipments: {
    [key: number]: {
      name: string;
    };
  };
}

export const equipmentDefinitions = fetch(asset('definitions/equipment.json'), {
  cache: 'no-cache',
}).then(async (response) => response.json() as Promise<EquipmentDefinitions>);
