import { equipmentDefinitions } from '@blitzkit/core';
import { useAwait } from './useAwait';

export function useEquipmentPreset(preset: string) {
  const awaitedEquipmentDefinitions = useAwait(equipmentDefinitions);
  return awaitedEquipmentDefinitions.presets[preset];
}
