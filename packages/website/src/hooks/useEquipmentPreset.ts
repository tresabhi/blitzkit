import { fetchEquipmentDefinitions } from '@blitzkit/core';
import { useAwait } from './useAwait';

const equipmentDefinitions = useAwait(fetchEquipmentDefinitions());

export function useEquipmentPreset(preset: string) {
  return equipmentDefinitions.presets[preset];
}
