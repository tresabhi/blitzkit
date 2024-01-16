import { asset } from './asset';

type EquipmentOptions = [number, number];

type EquipmentRow = [EquipmentOptions, EquipmentOptions, EquipmentOptions];

type EquipmentRows = [EquipmentRow, EquipmentRow, EquipmentRow];

interface EquipmentDefinitions {
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
